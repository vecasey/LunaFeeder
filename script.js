const foodBrands = [
  {
    name: "Whiskas",
    cupsPerDay: 0.5,
    caloriesPerCup: 400,
    caloriesPerCan: 190,
    caloriesPerPouch: 90,
    servingSizes: { cup: 1, can: 1, pouch: 1 }
  },
  {
    name: "Royal Canin",
    cupsPerDay: 0.45,
    caloriesPerCup: 385,
    caloriesPerCan: 200,
    caloriesPerPouch: 95,
    servingSizes: { cup: 1, can: 1, pouch: 1 }
  },
  {
    name: "Blue Buffalo",
    cupsPerDay: 0.44,
    caloriesPerCup: 420,
    caloriesPerCan: 210,
    caloriesPerPouch: 100,
    servingSizes: { cup: 1, can: 1, pouch: 1 }
  },
  {
    name: "Purina ONE",
    cupsPerDay: 0.48,
    caloriesPerCup: 395,
    caloriesPerCan: 180,
    caloriesPerPouch: 92,
    servingSizes: { cup: 1, can: 1, pouch: 1 }
  }
];

const brandSelect = document.getElementById("brand");
const servingType = document.getElementById("servingType");
const resultText = document.getElementById("resultText");
const brandDetails = document.getElementById("brandDetails");
const brandGrid = document.getElementById("brandGrid");

function populateBrandSelect() {
  foodBrands.forEach((brand) => {
    const option = document.createElement("option");
    option.value = brand.name;
    option.textContent = brand.name;
    brandSelect.appendChild(option);
  });
}

function renderBrandGrid() {
  brandGrid.innerHTML = "";
  foodBrands.forEach((brand) => {
    const tile = document.createElement("div");
    tile.className = "brand-tile";
    tile.innerHTML = `
      <h3>${brand.name}</h3>
      <p><strong>Calories / cup:</strong> ${brand.caloriesPerCup}</p>
      <p><strong>Calories / can:</strong> ${brand.caloriesPerCan}</p>
      <p><strong>Calories / pouch:</strong> ${brand.caloriesPerPouch}</p>
    `;
    brandGrid.appendChild(tile);
  });
}

function toKg(pounds) {
  return pounds * 0.45359237;
}

function calculateRER(weightKg) {
  return 70 * Math.pow(weightKg, 0.75);
}

function getCalorieTarget(currentWeight, goalWeight, active) {
  const currentKg = toKg(currentWeight);
  const goalKg = toKg(goalWeight);
  const currentRER = calculateRER(currentKg);
  const goalRER = calculateRER(goalKg);
  const maintainFactor = active ? 1.5 : 1.2;
  const lossFactor = active ? 1.1 : 1.0;
  const currentCalories = Math.round(currentRER * maintainFactor);
  const goalCalories = Math.round(goalRER * lossFactor);
  return { currentCalories, goalCalories };
}

function formatNumber(value) {
  return Number(value.toFixed(1));
}

function calculateFoodAmounts(brand, caloriesNeeded, servingTypeValue) {
  let servings = 0;
  let unitLabel = "servings";
  switch (servingTypeValue) {
    case "cup":
      servings = caloriesNeeded / brand.caloriesPerCup;
      unitLabel = "cups";
      break;
    case "can":
      servings = caloriesNeeded / brand.caloriesPerCan;
      unitLabel = "cans";
      break;
    case "pouch":
      servings = caloriesNeeded / brand.caloriesPerPouch;
      unitLabel = "pouches";
      break;
  }
  return { amount: formatNumber(servings), label: unitLabel };
}

function updateResult(event) {
  event.preventDefault();
  const gender = document.getElementById("gender").value;
  const currentWeight = Number(document.getElementById("currentWeight").value);
  const goalWeight = Number(document.getElementById("goalWeight").value);
  const selectedBrandName = brandSelect.value;
  const selectedBrand = foodBrands.find((brand) => brand.name === selectedBrandName);
  const active = document.getElementById("isActive").checked;
  const servingTypeValue = servingType.value;

  if (!selectedBrand || currentWeight <= 0 || goalWeight <= 0) {
    resultText.textContent = "Please enter valid weights and choose a food brand.";
    return;
  }

  const { currentCalories, goalCalories } = getCalorieTarget(currentWeight, goalWeight, active);
  const foodAmount = calculateFoodAmounts(selectedBrand, goalCalories, servingTypeValue);

  const planType = currentWeight > goalWeight ? "weight loss" : currentWeight < goalWeight ? "weight gain" : "maintenance";
  const genderPhrase = gender === "male" ? "male cat" : "female cat";

  resultText.innerHTML = `
    <p>For a <strong>${genderPhrase}</strong> currently weighing <strong>${currentWeight} lbs</strong> with a goal of <strong>${goalWeight} lbs</strong>:</p>
    <ul>
      <li>Estimated daily calories for ${planType}: <strong>${goalCalories} kcal</strong></li>
      <li>Maintenance-level calories at current weight: <strong>${currentCalories} kcal</strong></li>
      <li>Selected food: <strong>${selectedBrandName}</strong></li>
      <li>Feed about <strong>${foodAmount.amount} ${foodAmount.label}</strong> per day</li>
    </ul>
    <p>Use this as a guide and adjust slowly. Check with a veterinarian for a personalized plan.</p>
  `;

  brandDetails.innerHTML = `
    <div class="brand-tile">
      <h3>${selectedBrand.name} details</h3>
      <p><strong>Calories per cup:</strong> ${selectedBrand.caloriesPerCup}</p>
      <p><strong>Calories per can:</strong> ${selectedBrand.caloriesPerCan}</p>
      <p><strong>Calories per pouch:</strong> ${selectedBrand.caloriesPerPouch}</p>
    </div>
  `;
}

populateBrandSelect();
renderBrandGrid();

document.getElementById("calculatorForm").addEventListener("submit", updateResult);
