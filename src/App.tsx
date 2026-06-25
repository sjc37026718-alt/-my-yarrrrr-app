import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

interface Restaurant {
  id: number
  title: string
  is_complete: boolean
}

const FOOD_ICONS = ['🍕', '🍔', '🍣', '🍜', '🍰', '🌮', '🍝', '🥗', '🍩', '🧁', '🍱', '🥟', '🍗', '🥘', '🍤']

function FloatingIcons() {
  const [icons] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      emoji: FOOD_ICONS[i % FOOD_ICONS.length],
      left: Math.random() * 100,
      size: 20 + Math.random() * 24,
      duration: 12 + Math.random() * 18,
      delay: -(Math.random() * 20),
      drift: -40 + Math.random() * 80,
    }))
  )

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {icons.map((icon) => (
        <span
          key={icon.id}
          className="absolute animate-float opacity-40"
          style={{
            left: `${icon.left}%`,
            fontSize: `${icon.size}px`,
            animationDuration: `${icon.duration}s`,
            animationDelay: `${icon.delay}s`,
            '--drift': `${icon.drift}px`,
          } as React.CSSProperties}
        >
          {icon.emoji}
        </span>
      ))}
    </div>
  )
}

function App() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    const { data } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: true })
    if (data) setRestaurants(data)
    setLoading(false)
  }

  const addRestaurant = async () => {
    const title = input.trim()
    if (!title) return
    const { data } = await supabase
      .from('todos')
      .insert({ title })
      .select()
      .single()
    if (data) setRestaurants((prev) => [...prev, data])
    setInput('')
  }

  const toggleCheck = async (id: number, current: boolean) => {
    await supabase
      .from('todos')
      .update({ is_complete: !current })
      .eq('id', id)
    setRestaurants((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_complete: !current } : r))
    )
  }

  const deleteRestaurant = async (id: number) => {
    await supabase.from('todos').delete().eq('id', id)
    setRestaurants((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="min-h-screen bg-amber-50 text-gray-800 flex items-start justify-center pt-20 px-4">
      <FloatingIcons />

      <div className="w-full max-w-md relative z-10">
        <h1 className="text-4xl font-bold text-center mb-2 text-orange-600">
          🍽 Yarrrrr list
        </h1>
        <p className="text-center text-orange-400 mb-8 text-sm">
          나만의 맛집 리스트
        </p>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addRestaurant()}
            placeholder="가게명을 입력하세요"
            className="flex-1 px-4 py-2.5 bg-white border border-orange-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 shadow-sm"
          />
          <button
            onClick={addRestaurant}
            className="px-5 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-400 transition-colors shrink-0 shadow-sm cursor-pointer"
          >
            추가
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-12">불러오는 중...</p>
        ) : restaurants.length === 0 ? (
          <p className="text-center text-gray-400 py-12">
            아직 추가된 맛집이 없습니다
          </p>
        ) : (
          <ul className="space-y-2">
            {restaurants.map((r) => (
              <li
                key={r.id}
                className="flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-sm border border-orange-100 rounded-xl group shadow-sm"
              >
                <input
                  type="checkbox"
                  checked={r.is_complete}
                  onChange={() => toggleCheck(r.id, r.is_complete)}
                  className="w-4 h-4 accent-orange-500 shrink-0"
                />
                <span
                  className={`flex-1 ${r.is_complete ? 'line-through text-gray-400' : 'text-gray-700'}`}
                >
                  {r.title}
                </span>
                <button
                  onClick={() => deleteRestaurant(r.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App
