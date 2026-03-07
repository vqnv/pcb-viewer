export function getBaseName(name) {
  const parts = name.split("_");
  parts.pop(); // remove the last number
  return parts.join("_");
}

export function getComponentGroup(obj, gltfModel) {
  while (obj.parent && obj.parent !== gltfModel) {
    obj = obj.parent;
  }
  return obj;
}
