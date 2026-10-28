import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import { fetchFoods, type FoodDoc } from '../../lib/studentApi'

const card = 'cp-panel p-5'

const sourceLabel: Record<FoodDoc['source'], string> = {
  taco: 'TACO',
  tbca: 'TBCA',
  usda: 'USDA',
  manufacturer: 'Fabricante',
  manual: 'Manual',
}

export function NutritionistFoods() {
  const { user } = useAuth()
  const [foods, setFoods] = useState<FoodDoc[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.accessToken) return
    fetchFoods(user.accessToken, search)
      .then(setFoods)
      .catch(() => toast.error('Não foi possível carregar os alimentos.'))
      .finally(() => setLoading(false))
  }, [user?.accessToken, search])

  return (
    <div className="relative px-4 sm:px-8 pt-8 pb-28 max-w-[1080px] mx-auto space-y-6">
      <div>
        <h1 className="cp-display text-[clamp(32px,4vw,48px)] font-bold leading-[1.02]">Alimentos</h1>
        <p className="text-sm dark:text-zinc-400 mt-1">
          Base de referência TACO/TBCA (por 100 g). Não é a tabela oficial completa.
        </p>
      </div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar alimento"
        aria-label="Buscar alimento"
        className="cp-field cp-field-plain text-sm"
      />
      {loading && <p className="text-sm dark:text-zinc-400">Carregando…</p>}
      <section className={card}>
        {foods.length === 0 && !loading ? (
          <p className="text-sm dark:text-zinc-400">Nenhum alimento. Rode o seed demo.</p>
        ) : (
          <ul className="divide-y dark:divide-zinc-800">
            {foods.map((food) => (
              <li key={food.id} className="py-3 text-sm dark:text-white">
                <p className="font-medium">{food.name}</p>
                <p className="text-xs dark:text-zinc-400">
                  {food.calories} kcal · P {food.protein}g · C {food.carbs}g · G {food.fat}g ·{' '}
                  {sourceLabel[food.source]}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
