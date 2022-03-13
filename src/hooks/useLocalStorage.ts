import { useEffect, useState } from 'react'

export const PREFIX = "neural-net-"

function useLocalStorage<T>(
    key: string, 
    initialValue?: T
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {

  const prefixedKey = PREFIX + key
  const [value, setValue] = useState<T>(() => {

    const jsonValue = localStorage.getItem(prefixedKey)

    if (jsonValue != null) return JSON.parse(jsonValue)

    if (typeof initialValue === 'function') {
        return initialValue()
    } else {
        return initialValue
    }
  })

  const clearValue = () => sessionStorage.removeItem(PREFIX + key);

  useEffect(() => {
      if (value) localStorage.setItem(prefixedKey, JSON.stringify(value));
  }, [prefixedKey, value, initialValue])

  return [value, setValue, clearValue]
}

export default useLocalStorage;