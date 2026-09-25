import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createSportsCar } from "./vehicle-models.mjs";

const THREE_BUILD_URL = "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
const THREE_CORE_URL = "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.core.js";

function toDataUrl(source) {
  return `data:text/javascript;base64,${Buffer.from(source, "utf8").toString("base64")}`;
}

async function loadRealThree() {
  try {
    const [buildResponse, coreResponse] = await Promise.all([
      fetch(THREE_BUILD_URL),
      fetch(THREE_CORE_URL),
    ]);
    if (!buildResponse.ok || !coreResponse.ok) {
      throw new Error(`CDN HTTP ${buildResponse.status}/${coreResponse.status}`);
    }
    const [buildSource, coreSource] = await Promise.all([
      buildResponse.text(),
      coreResponse.text(),
    ]);
    const coreUrl = toDataUrl(coreSource);
    const moduleSource = buildSource.replaceAll("./three.core.js", coreUrl);
    if (moduleSource === buildSource) throw new Error("Import interno do Three.js não encontrado.");
    return await import(toDataUrl(moduleSource));
  } catch (error) {
    return { error };
  }
}

function geometryStats(root) {
  const stats = { meshes: 0, vertices: 0, indices: 0 };
  root.traverse((object) => {
    if (!object.isMesh || !object.geometry) return;
    stats.meshes += 1;
    const position = object.geometry.getAttribute("position");
    stats.vertices += position?.count ?? 0;
    stats.indices += object.geometry.index?.count ?? position?.count ?? 0;
  });
  return stats;
}

function assertFiniteModel(THREE, car) {
  car.root.updateMatrixWorld(true);
  car.root.traverse((object) => {
    for (const vector of [object.position, object.rotation, object.scale]) {
      assert.ok([vector.x, vector.y, vector.z].every(Number.isFinite), `${object.name} transform inválido`);
    }
    if (!object.isMesh || !object.geometry) return;
    for (const attribute of Object.values(object.geometry.attributes)) {
      assert.ok([...attribute.array].every(Number.isFinite), `${object.name} possui vértice inválido`);
    }
    if (object.geometry.index) {
      assert.ok([...object.geometry.index.array].every(Number.isInteger), `${object.name} possui índice inválido`);
    }
  });

  const bounds = new THREE.Box3().setFromObject(car.root);
  if (bounds.min.y < -car.dimensions.groundClearance - 0.02) {
    car.root.traverse((object) => {
      if (!object.isMesh) return;
      const meshBounds = new THREE.Box3().setFromObject(object);
      if (meshBounds.min.y < -car.dimensions.groundClearance - 0.02) console.error("TRANSFORM", object.position.toArray(), object.rotation.toArray(), object.parent.name, object.parent.position.toArray(), object.parent.parent?.name, object.parent.parent?.position.toArray());
      if (meshBounds.min.y < -car.dimensions.groundClearance - 0.02) console.error(object.name, meshBounds.min.toArray(), meshBounds.max.toArray());
    });
  }
  assert.ok([bounds.min.x, bounds.min.y, bounds.min.z, bounds.max.x, bounds.max.y, bounds.max.z].every(Number.isFinite));
  assert.ok(bounds.min.x >= -car.dimensions.width / 2 - 0.02);
  assert.ok(bounds.max.x <= car.dimensions.width / 2 + 0.02);
  assert.ok(bounds.min.y >= -car.dimensions.groundClearance - 0.02);
  assert.ok(bounds.max.y <= car.dimensions.height - car.dimensions.groundClearance + 0.02);
  assert.ok(bounds.min.z >= -car.dimensions.length / 2 - 0.02);
  assert.ok(bounds.max.z <= car.dimensions.length / 2 + 0.02);
  const collisionBounds = car.collisionProxy.clone().applyMatrix4(car.root.matrixWorld);
  assert.ok(bounds.min.x >= collisionBounds.min.x - 0.005);
  assert.ok(bounds.min.y >= collisionBounds.min.y - 0.005);
  assert.ok(bounds.min.z >= collisionBounds.min.z - 0.005);
  assert.ok(bounds.max.x <= collisionBounds.max.x + 0.005);
  assert.ok(bounds.max.y <= collisionBounds.max.y + 0.005);
  assert.ok(bounds.max.z <= collisionBounds.max.z + 0.005);
  return bounds;
}

const THREE = await loadRealThree();

if (THREE.error) {
  const source = await readFile(new URL("./vehicle-models.mjs", import.meta.url), "utf8");
  test("contrato estrutural permanece verificável sem CDN", () => {
    assert.equal(typeof createSportsCar, "function");
    assert.match(source, /return \{ root, bodyGroup, wheels, steeringWheels, collisionProxy, dimensions \}/);
    assert.match(source, /forwardAxis = "-Z"/);
  });

  test("geometria Three.js real — CDN indisponível", { skip: `Three.js CDN indisponível: ${THREE.error.message}` }, () => {});
} else {
  test("factory retorna contrato de carro fechado com quatro rodas e direção dianteira", () => {
    const car = createSportsCar(THREE, { detailLevel: "high" });
    assert.ok(car.root.isGroup);
    assert.ok(car.bodyGroup.isGroup);
    assert.equal(car.wheels.length, 4);
    assert.equal(car.steeringWheels.length, 2);
    assert.strictEqual(car.steeringWheels[0], car.wheels[0]);
    assert.strictEqual(car.steeringWheels[1], car.wheels[1]);
    assert.equal(car.root.userData.forwardAxis, "-Z");
    assert.equal(car.root.userData.upAxis, "+Y");
    assert.ok(car.steeringWheels[0].position.z < car.wheels[2].position.z);
  });

  test("silhueta, transforms e buffers permanecem finitos dentro das dimensões declaradas", () => {
    const car = createSportsCar(THREE, { paintColor: 0x0d2a45, detailLevel: "high" });
    const bounds = assertFiniteModel(THREE, car);
    const frontLights = car.root.getObjectByName("front-lights");
    const rearLights = car.root.getObjectByName("rear-lights");
    assert.ok(frontLights && rearLights);
    assert.ok(frontLights.children.every((light) => light.position.z < 0));
    assert.ok(rearLights.children.every((light) => light.position.z > 0));
    assert.ok(bounds.min.z < -2);
    assert.ok(bounds.max.z > 2);
  });

  test("três perfis de cupê têm formas distintas sem exceder o footprint de colisão", () => {
    const profiles = ["Apex", "GrandTourer", "HyperWedge"].map((profile) => createSportsCar(THREE, {
      profile,
      detailLevel: "high",
    }));
    const roofHeights = profiles.map((car) => car.root.getObjectByName("glass-cabin").geometry.boundingBox.max.y);
    assert.deepEqual(profiles.map((car) => car.root.userData.vehicleProfile), ["Apex", "GrandTourer", "HyperWedge"]);
    assert.equal(new Set(roofHeights).size, 3);
    for (const car of profiles) assertFiniteModel(THREE, car);
  });

  test("collisionProxy cobre carroceria e asa sob o sway aplicado pelo jogo", () => {
    for (const profile of ["Apex", "GrandTourer", "HyperWedge"]) {
      const car = createSportsCar(THREE, { profile, detailLevel: "high" });
      for (const sway of [-0.1, 0.1]) {
        car.bodyGroup.rotation.z = sway;
        car.root.updateMatrixWorld(true);
        const currentBounds = new THREE.Box3().setFromObject(car.root);
        console.log(profile, sway, currentBounds.min.toArray(), currentBounds.max.toArray());
        assertFiniteModel(THREE, car);
      }
    }
  });

  test("rodas dianteiras e traseiras respeitam wheelbase, width e animação individual", () => {
    const car = createSportsCar(THREE, { detailLevel: "high" });
    const expectedAxleZ = car.dimensions.wheelbase / 2;
    assert.ok(Math.abs(car.steeringWheels[0].position.z + expectedAxleZ) < 1e-12);
    assert.ok(Math.abs(car.wheels[2].position.z - expectedAxleZ) < 1e-12);
    assert.ok(car.wheels.every((wheel) => Math.abs(wheel.position.x) < car.dimensions.width / 2));
    for (const wheel of car.wheels) {
      assert.ok(wheel.getObjectByName(`tire-${car.wheels.indexOf(wheel)}`));
      assert.ok(wheel.getObjectByName(`brake-disc-${car.wheels.indexOf(wheel)}`));
      assert.ok(wheel.children.some((child) => child.name.startsWith("wheel-spokes-")));
    }
    assert.ok(car.root.getObjectByName("suspension"));
    assert.ok(car.root.getObjectByName("rear-wing"));
  });

  test("collisionProxy é local, finito e coincide com length/width/height", () => {
    const car = createSportsCar(THREE, { detailLevel: "medium" });
    assert.ok(car.collisionProxy.isBox3);
    const size = car.collisionProxy.getSize(new THREE.Vector3());
    assert.ok([size.x, size.y, size.z].every(Number.isFinite));
    assert.ok(Math.abs(size.x - car.dimensions.width) < 1e-12);
    assert.ok(Math.abs(size.y - car.dimensions.height) < 1e-12);
    assert.ok(Math.abs(size.z - car.dimensions.length) < 1e-12);
    assert.equal(car.collisionProxy.min.y, -car.dimensions.groundClearance);
    assert.equal(car.collisionProxy.max.y, car.dimensions.height - car.dimensions.groundClearance);
  });

  test("detail low reduz subgeometrias em relação a high", () => {
    const low = createSportsCar(THREE, { detailLevel: "low" });
    const high = createSportsCar(THREE, { detailLevel: "high" });
    const lowStats = geometryStats(low.root);
    const highStats = geometryStats(high.root);
    assert.ok(highStats.meshes > lowStats.meshes, `${lowStats.meshes} !< ${highStats.meshes}`);
    assert.ok(highStats.vertices > lowStats.vertices, `${lowStats.vertices} !< ${highStats.vertices}`);
    assert.equal(low.root.userData.detailLevel, "low");
    assert.equal(high.root.userData.detailLevel, "high");
  });

  test("paintColor e livery produzem materiais visivelmente distintos", () => {
    const navy = createSportsCar(THREE, { paintColor: 0x0d2a45, livery: "cyan", detailLevel: "medium" });
    const silver = createSportsCar(THREE, { paintColor: 0xc7d9df, livery: "silver", detailLevel: "medium" });
    const navyPaint = navy.root.getObjectByName("paint-hull");
    const silverPaint = silver.root.getObjectByName("paint-hull");
    const navyStripe = navy.root.getObjectByName("hood-livery-stripe");
    const silverStripe = silver.root.getObjectByName("hood-livery-stripe");
    assert.equal(navyPaint.material.color.getHex(), 0x0d2a45);
    assert.equal(silverPaint.material.color.getHex(), 0xc7d9df);
    assert.notEqual(navyStripe.material.color.getHex(), silverStripe.material.color.getHex());
    assert.equal(navy.root.userData.livery, 0);
    assert.equal(silver.root.userData.livery, 1);
  });
}
