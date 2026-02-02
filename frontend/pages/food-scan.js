import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { Upload, Check, X, AlertCircle } from 'lucide-react'

const API = 'http://localhost:8000'

export default function FoodScan() {
  const router = useRouter()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [stage, setStage] = useState('upload') // upload, detect, confirm, done
  const [selectedFoods, setSelectedFoods] = useState([])
  const [portions, setPortions] = useState({})

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  function handleFileChange(e) {
    const f = e.target.files[0]
    if (f) {
      setFile(f)
      const reader = new FileReader()
      reader.onload = (evt) => setPreview(evt.target.result)
      reader.readAsDataURL(f)
    }
  }

  async function handleUpload(e) {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)

      const res = await fetch(`${API}/food-scan/upload`, {
        method: 'POST',
        body: fd,
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setResult(data)
        setStage('detect')
        setSelectedFoods(data.detected || [])
        setSelectedFoods.forEach((food) => {
          setPortions((prev) => ({ ...prev, [food]: 1 }))
        })
      }
    } catch (e) {
      console.error('Upload failed:', e)
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirm(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${API}/food-scan/estimate`, {
        method: 'POST',
        body: JSON.stringify({
          foods: selectedFoods,
          portions,
          image_url: result.image_url,
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        setResult((prev) => ({ ...prev, ...data }))
        setStage('done')
      }
    } catch (e) {
      console.error('Estimate failed:', e)
    } finally {
      setLoading(false)
    }
  }

  function toggleFood(food) {
    if (selectedFoods.includes(food)) {
      setSelectedFoods(selectedFoods.filter((f) => f !== food))
    } else {
      setSelectedFoods([...selectedFoods, food])
      setPortions((prev) => ({ ...prev, [food]: 1 }))
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Stages */}
      <div className="flex items-center justify-between mb-8">
        {[
          { name: 'Upload', id: 'upload' },
          { name: 'Detect', id: 'detect' },
          { name: 'Confirm', id: 'confirm' },
          { name: 'Done', id: 'done' },
        ].map((s, idx) => (
          <div key={s.id} className="flex-1 flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                ['upload', 'detect', 'confirm', 'done'].indexOf(stage) >= idx
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              {['upload', 'detect', 'confirm', 'done'].indexOf(stage) > idx ? (
                <Check size={20} />
              ) : (
                idx + 1
              )}
            </div>
            <div className={`flex-1 h-1 mx-2 ${idx < 3 ? 'bg-gray-700' : 'hidden'}`} />
          </div>
        ))}
      </div>

      {/* Upload Stage */}
      {stage === 'upload' && (
        <div className="bg-gray-800 rounded-lg p-12 border-2 border-dashed border-gray-600 text-center">
          <Upload className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-2xl font-bold mb-2">Upload a Food Image</h3>
          <p className="text-gray-400 mb-6">Take a photo or upload an image of your meal</p>
          <form onSubmit={handleUpload} className="space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="foodImage"
            />
            <label
              htmlFor="foodImage"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition"
            >
              Choose Image
            </label>
            {preview && (
              <div className="mt-4">
                <img src={preview} alt="Preview" className="max-h-96 mx-auto rounded-lg" />
              </div>
            )}
            <button
              type="submit"
              disabled={!file || loading}
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg font-semibold transition"
            >
              {loading ? 'Analyzing...' : 'Detect Foods'}
            </button>
          </form>
        </div>
      )}

      {/* Detect Stage */}
      {stage === 'detect' && result && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold mb-4">Detected Foods</h3>
              <img src={preview} alt="Uploaded" className="rounded-lg w-full" />
              <p className="text-sm text-gray-400 mt-4">
                <AlertCircle className="inline mr-2" size={16} />
                AI-assisted estimation. Adjust portions for accuracy.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Select Foods & Portions</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {result.detected && result.detected.map((food) => (
                  <div
                    key={food}
                    className={`p-4 rounded-lg border cursor-pointer transition ${
                      selectedFoods.includes(food)
                        ? 'bg-blue-600 border-blue-500'
                        : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    }`}
                    onClick={() => toggleFood(food)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{food}</span>
                      <Check
                        size={20}
                        className={selectedFoods.includes(food) ? 'text-white' : 'text-gray-500'}
                      />
                    </div>
                    {selectedFoods.includes(food) && (
                      <div className="mt-3">
                        <label className="text-sm text-gray-300 block mb-2">Portion (servings):</label>
                        <input
                          type="number"
                          min="0.25"
                          step="0.25"
                          value={portions[food] || 1}
                          onChange={(e) =>
                            setPortions((prev) => ({ ...prev, [food]: parseFloat(e.target.value) }))
                          }
                          className="w-full px-3 py-2 bg-gray-800 rounded border border-gray-500 text-white"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleConfirm}
                disabled={selectedFoods.length === 0 || loading}
                className="w-full mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg font-semibold transition"
              >
                {loading ? 'Calculating...' : 'Calculate Nutrition'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Done Stage */}
      {stage === 'done' && result && (
        <div className="space-y-6">
          <div className="bg-green-600/20 border border-green-500 rounded-lg p-6 text-center">
            <Check className="mx-auto mb-2 text-green-400" size={48} />
            <h3 className="text-2xl font-bold">Nutrition Estimated!</h3>
            <p className="text-gray-300 mt-2">Your meal has been logged to your profile.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-6 border border-white/10">
              <h4 className="font-bold mb-4">Macros</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Protein</span>
                    <span className="font-bold">{result.estimated_protein || 0}g</span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${Math.min((result.estimated_protein / 50) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Carbs</span>
                    <span className="font-bold">{result.estimated_carbs || 0}g</span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min((result.estimated_carbs / 100) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Fats</span>
                    <span className="font-bold">{result.estimated_fats || 0}g</span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${Math.min((result.estimated_fats / 50) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-white/10">
              <h4 className="font-bold mb-4">Total Calories</h4>
              <div className="text-5xl font-bold text-blue-400 mb-4">
                {result.estimated_calories || 0}
              </div>
              <p className="text-gray-400 text-sm mb-4">kcal</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
