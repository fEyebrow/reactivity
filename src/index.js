const targetMap = new WeakMap()

const track = (target, key) => {
  console.log('track', key)
  if (!activeEffect) return
  let depsMap = targetMap.get(target);
  if (!depsMap)  {
    targetMap.set(target, depsMap = new Map())
  }

  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, dep = new Set())
  }

  dep.add(activeEffect)
}

const trigger = (target, key) => {
  console.log('trigger', key)
  const depsMap = targetMap.get(target)

  if(!depsMap) {
    return
  }

  const dep = depsMap.get(key)
  if(!dep) {
    return
  }
  dep.forEach(effect => {
    effect()
  });
}

const reactive = (target) => {
  const handler = {
    get(target, key, receiver) {
      let result = Reflect.get(target, key, receiver)
      track(target, key)
      return result
    },
    set(target, key, value, receiver) {
      let oldValue = target[key]
      let result = Reflect.set(target, key, value, receiver)
      if (result && oldValue !== value) {
        trigger(target, key)
      }
      return result
    }
  }
  return new Proxy(target, handler)
}

const ref = (val) => {
  const r = {
    get value() {
      track(r, 'value')
      return val
    },

    set value(newVal) {
      if (newVal === val) return
      val = newVal
      trigger(r, 'value')
    }
  }
  return r
}

let activeEffect = null
let effect = (fn) => {
  activeEffect = fn
  activeEffect()
  activeEffect = null
}

const computed = (getter) => {
  const res = ref()
  effect(() => res.value = getter())
  return res
}

let product = reactive({ price: 5, quantity: 2 })
let salePrice = computed(() => {
  return product.price * 0.9
})

let total = computed(() => {
  return salePrice.value * product.quantity
})


console.log(
  `Before updated quantity total (should be 9) = ${total.value} salePrice (should be 4.5) = ${salePrice.value}`
)
product.quantity = 3
console.log(
  `After updated quantity total (should be 13.5) = ${total.value} salePrice (should be 4.5) = ${salePrice.value}`
)
product.price = 10
console.log(
  `After updated price total (should be 27) = ${total.value} salePrice (should be 9) = ${salePrice.value}`
)

