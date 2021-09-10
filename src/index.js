const targetMap = new WeakMap()

const track = (target, key) => {
  let depsMap = targetMap.get(targetMap);
  if (!depsMap)  {
    targetMap.set(target, depsMap = new Map())
  }

  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, dep = new Set())
  }

  dep.add(effect)
}

const trigger = (target, key) => {
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

let product = { price: 2, quality: 2 }
let total = 0
let effect = () => {
  total = product.price * product.quality
}

track(product, 'price')
effect()
console.log(total)

product.price = 10
trigger(product, 'price')
console.log(total)