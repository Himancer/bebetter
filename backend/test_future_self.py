import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch
import requests

os.environ.setdefault('DATABASE_URL', 'sqlite://')
os.environ.setdefault('SECRET_KEY', 'future-self-test-secret')
os.environ['GROQ_API_KEY'] = ''
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app import app
from models import db, FutureSelfProfile


class FutureSelfApiTests(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        with app.app_context():
            db.drop_all()
            db.create_all()
        self.client = app.test_client()
        self.client.post('/api/auth/register', json={'username': 'player-one', 'player_name': 'Himanshu', 'password': 'password-123'})
        login = self.client.post('/api/auth/login', json={'username': 'player-one', 'password': 'password-123'})
        self.headers = {'Authorization': f"Bearer {login.get_json()['token']}"}
        self.profile = {
            'vision': 'I want to be focused, healthier, and dependable in my everyday life.',
            'inspiration': 'A calm and strategic leader',
            'focus_areas': ['Time & focus', 'Career & learning'],
            'weekly_hours': 3,
            'current_routine': 'I study and work during the week.',
            'constraints': 'Evenings are busy, so small sessions work best.',
            'coaching_style': 'calm',
            'ai_personalization_consent': False,
        }

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_new_user_starts_without_a_profile(self):
        response = self.client.get('/api/future-self', headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.get_json()['profile'])

    def test_account_exposes_username_and_editable_player_name(self):
        login = self.client.post('/api/auth/login', json={'username': 'player-one', 'password': 'password-123'})
        self.assertEqual(login.get_json()['username'], 'player-one')
        self.assertEqual(login.get_json()['player_name'], 'Himanshu')

        account = self.client.get('/api/account', headers=self.headers)
        self.assertEqual(account.status_code, 200)
        self.assertEqual(account.get_json(), {'username': 'player-one', 'player_name': 'Himanshu'})

        updated = self.client.put('/api/player', json={'name': 'Himanshu P.'}, headers=self.headers)
        self.assertEqual(updated.status_code, 200)
        account = self.client.get('/api/account', headers=self.headers)
        self.assertEqual(account.get_json()['player_name'], 'Himanshu P.')

        signup = self.client.post('/api/auth/register', json={
            'username': 'player-two', 'player_name': 'Second Player', 'password': 'password-456',
        })
        self.assertEqual(signup.get_json()['player_name'], 'Second Player')

    def test_profile_requires_a_goal_and_focus_area(self):
        response = self.client.put('/api/future-self/profile', json={'vision': 'Too short'}, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.get_json())

    def test_opt_out_saves_profile_and_creates_local_personal_quests(self):
        saved = self.client.put('/api/future-self/profile', json=self.profile, headers=self.headers)
        self.assertEqual(saved.status_code, 200)
        self.assertFalse(saved.get_json()['profile']['ai_personalization_consent'])

        plan_response = self.client.post('/api/future-self/plan', headers=self.headers)
        self.assertEqual(plan_response.status_code, 200)
        plan = plan_response.get_json()['profile']['plan']
        self.assertEqual(plan['plan_kind'], 'starter')
        self.assertEqual(len(plan['daily_quests']), 2)

        quests = self.client.get('/api/quest', headers=self.headers).get_json()
        self.assertEqual(len(quests), 2)
        self.assertTrue(all(quest['quest_type'].startswith('personal_') for quest in quests))

    def test_profile_context_is_only_added_to_groq_after_opt_in(self):
        self.client.put('/api/future-self/profile', json=self.profile, headers=self.headers)
        with patch('routes.chat.GROQ_API_KEY', 'test-key'), patch('routes.chat.requests.post') as mock_response:
            mock_response.return_value.json.return_value = {'choices': [{'message': {'content': 'A small step is enough.'}}]}
            response = self.client.post('/api/chat', json={'message': 'Help me make time.'}, headers=self.headers)
            self.assertEqual(response.status_code, 200)
            payload = mock_response.call_args.kwargs['json']
            self.assertEqual(payload['messages'][-1]['content'], 'Help me make time.')
            self.assertNotIn(self.profile['vision'], str(payload['messages']))

    def test_opt_in_adds_profile_context_to_groq_request(self):
        self.profile['ai_personalization_consent'] = True
        self.client.put('/api/future-self/profile', json=self.profile, headers=self.headers)
        with patch('routes.chat.GROQ_API_KEY', 'test-key'), patch('routes.chat.requests.post') as mock_response:
            mock_response.return_value.json.return_value = {'choices': [{'message': {'content': 'A small step is enough.'}}]}
            response = self.client.post('/api/chat', json={'message': 'Help me make time.'}, headers=self.headers)
            self.assertEqual(response.status_code, 200)
            payload = mock_response.call_args.kwargs['json']
            self.assertIn(self.profile['vision'], payload['messages'][1]['content'])

    def test_chat_uses_recent_context_and_conversational_coach_prompt(self):
        with patch('routes.chat.GROQ_API_KEY', 'test-key'), patch('routes.chat.requests.post') as mock_response:
            mock_response.return_value.json.return_value = {'choices': [{'message': {'content': 'Let’s make tonight manageable.'}}]}
            for message in ('hey', 'I have exams this week', 'What should I focus on tonight?'):
                response = self.client.post('/api/chat', json={'message': message}, headers=self.headers)
                self.assertEqual(response.status_code, 200)

            payload = mock_response.call_args.kwargs['json']
            self.assertEqual(payload['messages'][-1]['content'], 'What should I focus on tonight?')
            self.assertIn('I have exams this week', str(payload['messages']))
            self.assertIn('Let’s make tonight manageable.', str(payload['messages']))
            self.assertIn('not a survey', payload['messages'][0]['content'])
            self.assertIn('at most one relevant follow-up question', payload['messages'][0]['content'])
            self.assertEqual(payload['max_tokens'], 640)

    def test_opt_in_is_persisted_for_future_personalization(self):
        self.profile['ai_personalization_consent'] = True
        response = self.client.put('/api/future-self/profile', json=self.profile, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        with app.app_context():
            saved = FutureSelfProfile.query.first()
            self.assertTrue(saved.ai_personalization_consent)

    def test_groq_failure_falls_back_to_a_saved_answer_starter_plan(self):
        self.profile['ai_personalization_consent'] = True
        self.client.put('/api/future-self/profile', json=self.profile, headers=self.headers)
        with patch('routes.future_self.GROQ_API_KEY', 'test-key'), patch(
            'routes.future_self.requests.post', side_effect=requests.Timeout('provider unavailable')
        ):
            response = self.client.post('/api/future-self/plan', headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['profile']['plan']['plan_kind'], 'starter')
        self.assertIn('starter plan', response.get_json()['notice'])


if __name__ == '__main__':
    unittest.main()
