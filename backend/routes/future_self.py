from flask import Blueprint, jsonify, request
from models import db, FutureSelfProfile, Player, Quest, Workout, get_ist_date, get_ist_now
import json
import os
import re
import requests

future_self_bp = Blueprint('future_self', __name__)
GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
GROQ_MODEL = os.environ.get('GROQ_MODEL', 'openai/gpt-oss-20b')

AREAS = {
    'Health & energy', 'Career & learning', 'Time & focus', 'Confidence',
    'Relationships', 'Creativity', 'Money habits', 'Mental wellbeing',
}

PRACTICES = {
    'Health & energy': ('Move in a way that fits your current ability', 'Log how your energy felt afterward', '🚶'),
    'Career & learning': ('Spend 20 minutes on one useful skill', 'Write down one thing you learned', '📚'),
    'Time & focus': ('Choose one priority for tomorrow', 'Protect one short focus block', '🧭'),
    'Confidence': ('Do one small task you have been putting off', 'Note what helped you start', '🌱'),
    'Relationships': ('Give one person your full attention', 'Send a thoughtful check-in', '💬'),
    'Creativity': ('Make something for 15 minutes', 'Save one rough idea without judging it', '🎨'),
    'Money habits': ('Review one recent expense', 'Write down one money question to resolve', '🪙'),
    'Mental wellbeing': ('Take a short pause without a screen', 'Write one sentence about what is taking energy', '☁️'),
}


def _profile_for(user_id):
    return FutureSelfProfile.query.filter_by(user_id=user_id).first()


def _validate_profile(data):
    if not isinstance(data, dict):
        return None, 'Profile details are required.'
    vision = str(data.get('vision', '')).strip()
    if len(vision) < 20:
        return None, 'Describe the person you want to become in at least 20 characters.'
    if len(vision) > 1500:
        return None, 'Keep your description under 1,500 characters.'
    try:
        hours = float(data.get('weekly_hours', 3))
    except (TypeError, ValueError):
        return None, 'Weekly time must be a number.'
    if not 0.5 <= hours <= 80:
        return None, 'Weekly time must be between 0.5 and 80 hours.'
    areas = data.get('focus_areas', [])
    if not isinstance(areas, list):
        return None, 'Choose one or more focus areas.'
    areas = list(dict.fromkeys(str(area) for area in areas if str(area) in AREAS))[:5]
    if not areas:
        return None, 'Choose at least one focus area.'
    style = data.get('coaching_style', 'calm')
    if style not in {'calm', 'direct', 'warm'}:
        style = 'calm'
    return {
        'vision': vision,
        'inspiration': str(data.get('inspiration', '')).strip()[:200],
        'focus_areas': areas,
        'weekly_hours': hours,
        'current_routine': str(data.get('current_routine', '')).strip()[:1000],
        'constraints': str(data.get('constraints', '')).strip()[:1000],
        'coaching_style': style,
        'ai_personalization_consent': data.get('ai_personalization_consent') is True,
    }, None


def _make_starter_plan(profile):
    areas = profile.focus_areas or ['Time & focus']
    hours = profile.weekly_hours or 3
    selected = [PRACTICES.get(area, PRACTICES['Time & focus']) for area in areas[:3]]
    practices = [
        {'practice': item[0], 'frequency': '2–3 times this week', 'minutes': max(10, min(30, round(hours * 60 / 6)))}
        for item in selected
    ]
    quests = []
    for index, area in enumerate(areas[:3]):
        start, follow_up, icon = PRACTICES.get(area, PRACTICES['Time & focus'])
        quests.append({
            'title': start[:60],
            'description': follow_up,
            'icon': icon,
            'xp_reward': 15 + index * 5,
        })
    return {
        'future_self': 'A direction to work toward, based on what you described: ' + profile.vision[:280],
        'timeline': 'Start with a 2-week experiment, then review your logged actions and adjust. There is no reliable finish date for becoming this version of yourself; it depends on your circumstances and what changes along the way.',
        'assumptions': [
            f'The plan uses about {hours:g} hours a week for the focus areas you chose.',
            'The first review is a checkpoint to learn what fits, not a promise of a specific outcome.',
            'Your routine and constraints may change; edit this profile when they do.',
        ],
        'milestones': [
            {'title': 'Make the first step repeatable', 'timeframe': 'Weeks 1–2', 'evidence': 'You complete a few small actions and learn which ones fit your week.', 'first_step': quests[0]['title']},
            {'title': 'Review what is working', 'timeframe': 'At the 2-week check-in', 'evidence': 'Your activity log shows what happened, including missed days and barriers.', 'first_step': 'Keep the useful actions; shrink or replace the ones that did not fit.'},
            {'title': 'Choose the next stretch', 'timeframe': 'After the check-in', 'evidence': 'You can point to a routine that is becoming more consistent.', 'first_step': 'Add one small challenge only if the current rhythm feels manageable.'},
        ],
        'weekly_rhythm': practices,
        'daily_quests': quests,
        'when_stuck': [
            {'obstacle': 'A day gets too busy', 'response': 'Use a 5-minute version of the action or move it to a realistic time; do not double the workload tomorrow.'},
            {'obstacle': 'You miss a few days', 'response': 'Look for the obstacle, reduce the next step, and restart without trying to make up every missed action.'},
            {'obstacle': 'Motivation drops', 'response': 'Choose the smallest useful action and judge the plan by what fits your week, not by how motivated you feel.'},
        ],
        'plan_kind': 'starter',
    }


def _sync_today_personal_quests(user_id, plan):
    today = get_ist_date()
    if Quest.query.filter_by(user_id=user_id, date=today).first():
        return
    quests = []
    for index, item in enumerate((plan.get('daily_quests') or [])[:3]):
        if not isinstance(item, dict) or not item.get('title'):
            continue
        quests.append(Quest(
            user_id=user_id,
            title=str(item.get('title', 'A small step'))[:200],
            description=str(item.get('description', 'A small action for the person you are building toward.'))[:500],
            xp_reward=min(max(int(item.get('xp_reward', 20)), 5), 35),
            quest_type=f'personal_{index + 1}',
            icon=str(item.get('icon', '🌱'))[:50],
        ))
    if quests:
        db.session.add_all(quests)
        db.session.commit()


PLAN_SYSTEM = """You create a realistic personal growth plan for BeBetter. The user's description is an aspiration, not a guarantee or a diagnosis. Build toward the most attainable version consistent with the person's stated constraints, time, and current routine. Do not promise they will become someone else or claim to perfectly reproduce a real or fictional inspiration. Translate inspiration into broad traits and habits. Give ranges, assumptions, and observable progress signals. Keep first steps small enough for the time available. Never recommend unsafe dieting, extreme exercise, sleep deprivation, or replacing professional care.
Return only valid JSON with this shape:
{"future_self":"2-3 grounded sentences","timeline":"a realistic range and what it means; not a promise","assumptions":["up to 3"],"milestones":[{"title":"...","timeframe":"...","evidence":"observable signal","first_step":"..."}],"weekly_rhythm":[{"practice":"...","frequency":"...","minutes":20}],"daily_quests":[{"title":"short action","description":"specific and doable today","icon":"🌱","xp_reward":20}],"when_stuck":[{"obstacle":"...","response":"practical response"}]}
Use 3-5 milestones, 3 weekly practices, exactly 3 daily quests, and up to 3 when_stuck entries. Do not claim XP or completing every quest guarantees the outcome. The person can revise this plan."""


def _generate_ai_plan(profile, player, recent_workouts):
    if not GROQ_API_KEY:
        return None
    context = {
        'vision': profile.vision,
        'inspiration': profile.inspiration,
        'focus_areas': profile.focus_areas,
        'weekly_hours': profile.weekly_hours,
        'current_routine': profile.current_routine,
        'constraints': profile.constraints,
        'logged_progress_summary': {
            'level': player.level if player else 1,
            'rank': player.rank if player else 'E',
            'total_xp': player.total_xp if player else 0,
            'workouts_logged_last_14_days': recent_workouts,
        },
    }
    response = requests.post(
        'https://api.groq.com/openai/v1/chat/completions',
        headers={'Authorization': f'Bearer {GROQ_API_KEY}', 'Content-Type': 'application/json'},
        json={'model': GROQ_MODEL, 'messages': [
            {'role': 'system', 'content': PLAN_SYSTEM},
            {'role': 'user', 'content': json.dumps(context, ensure_ascii=False)},
        ], 'temperature': 0.4, 'max_tokens': 1800},
        timeout=35,
    )
    response.raise_for_status()
    content = response.json()['choices'][0]['message']['content'].strip()
    content = re.sub(r'^```(?:json)?\s*|\s*```$', '', content, flags=re.IGNORECASE)
    plan = json.loads(content)
    if not isinstance(plan, dict) or not all(key in plan for key in ('future_self', 'timeline', 'milestones', 'daily_quests')):
        raise ValueError('AI plan response was missing required sections.')
    plan['future_self'] = str(plan.get('future_self', ''))[:1400]
    plan['timeline'] = str(plan.get('timeline', ''))[:1200]
    assumptions = plan.get('assumptions', [])
    if not isinstance(assumptions, list):
        assumptions = []
    plan['assumptions'] = [str(item)[:400] for item in assumptions if item][:4]
    milestones = plan.get('milestones', [])
    if not isinstance(milestones, list):
        milestones = []
    plan['milestones'] = [{
        key: str(item.get(key, ''))[:500]
        for key in ('title', 'timeframe', 'evidence', 'first_step')
    } for item in milestones if isinstance(item, dict)][:5]
    rhythm = plan.get('weekly_rhythm', [])
    if not isinstance(rhythm, list):
        rhythm = []
    def safe_minutes(value):
        try:
            return min(max(int(float(value)), 5), 180)
        except (TypeError, ValueError, OverflowError):
            return 20
    plan['weekly_rhythm'] = [{
        'practice': str(item.get('practice', ''))[:300],
        'frequency': str(item.get('frequency', ''))[:120],
        'minutes': safe_minutes(item.get('minutes', 20)),
    } for item in rhythm if isinstance(item, dict)][:4]
    when_stuck = plan.get('when_stuck', [])
    if not isinstance(when_stuck, list):
        when_stuck = []
    plan['when_stuck'] = [{
        'obstacle': str(item.get('obstacle', ''))[:240],
        'response': str(item.get('response', ''))[:500],
    } for item in when_stuck if isinstance(item, dict)][:3]
    clean_quests = []
    daily_quests = plan.get('daily_quests', [])
    if not isinstance(daily_quests, list):
        daily_quests = []
    for item in daily_quests[:3]:
        if not isinstance(item, dict) or not item.get('title'):
            continue
        try:
            xp_reward = int(float(item.get('xp_reward', 20)))
        except (TypeError, ValueError):
            xp_reward = 20
        clean_quests.append({
            'title': str(item['title'])[:200],
            'description': str(item.get('description', 'A small step toward your goals.'))[:500],
            'icon': str(item.get('icon', '🌱'))[:50],
            'xp_reward': min(max(xp_reward, 5), 35),
        })
    plan['daily_quests'] = clean_quests
    if len(plan['daily_quests']) < 3:
        plan['daily_quests'] = _make_starter_plan(profile)['daily_quests']
    plan['plan_kind'] = 'ai'
    return plan


@future_self_bp.route('/future-self', methods=['GET'])
def get_future_self():
    profile = _profile_for(request.user.id)
    return jsonify({'profile': profile.to_dict() if profile else None})


@future_self_bp.route('/future-self/profile', methods=['PUT'])
def save_future_self_profile():
    values, error = _validate_profile(request.get_json(silent=True))
    if error:
        return jsonify({'error': error}), 400
    profile = _profile_for(request.user.id)
    if profile is None:
        profile = FutureSelfProfile(user_id=request.user.id, **values)
        db.session.add(profile)
    else:
        for key, value in values.items():
            setattr(profile, key, value)
        profile.plan = None
        profile.plan_updated_at = None
    db.session.commit()
    return jsonify({'profile': profile.to_dict()})


@future_self_bp.route('/future-self/plan', methods=['POST'])
def create_future_self_plan():
    profile = _profile_for(request.user.id)
    if profile is None:
        return jsonify({'error': 'Complete your Future Self profile first.'}), 400
    notice = None
    if profile.ai_personalization_consent:
        try:
            from datetime import timedelta
            recent_workouts = Workout.query.filter(
                Workout.user_id == request.user.id,
                Workout.date >= get_ist_date() - timedelta(days=14),
            ).count()
            player = Player.query.filter_by(user_id=request.user.id).first()
            profile.plan = _generate_ai_plan(profile, player, recent_workouts)
        except Exception as error:
            print('Future Self plan generation failed:', str(error))
            profile.plan = _make_starter_plan(profile)
            notice = 'Groq could not generate a plan right now, so this starter plan uses your saved answers. You can refresh it later.'
    if profile.plan is None and not notice:
        profile.plan = _make_starter_plan(profile)
        if profile.ai_personalization_consent:
            notice = 'Groq is not configured on this server yet, so this is a starter plan rather than an AI-generated estimate.'
    profile.plan_updated_at = get_ist_now()
    db.session.commit()
    _sync_today_personal_quests(request.user.id, profile.plan)
    return jsonify({'profile': profile.to_dict(), 'notice': notice})
