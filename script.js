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
const wetBrandSelect = document.getElementById("wetBrand");
const servingType = document.getElementById("servingType");
const wetServingType = document.getElementById("wetServingType");
const wetAmountInput = document.getElementById("wetAmount");
const resultText = document.getElementById("resultText");
const brandDetails = document.getElementById("brandDetails");
const brandGrid = document.getElementById("brandGrid");

function populateBrandSelect(selectElement) {
  foodBrands.forEach((brand) => {
    const option = document.createElement("option");
    option.value = brand.name;
    option.textContent = brand.name;
    selectElement.appendChild(option);
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

function calculateWetCalories(brand, amount, servingTypeValue) {
  if (!brand || amount <= 0) return 0;
  switch (servingTypeValue) {
    case "can":
      return amount * brand.caloriesPerCan;
    case "pouch":
      return amount * brand.caloriesPerPouch;
    default:
      return 0;
  }
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
  const wetBrandName = wetBrandSelect.value;
  const wetBrand = foodBrands.find((brand) => brand.name === wetBrandName);
  const wetServingTypeValue = wetServingType.value;
  const wetAmount = Number(wetAmountInput.value);

  if (!selectedBrand || currentWeight <= 0 || goalWeight <= 0) {
    resultText.textContent = "Please enter valid weights and choose a dry food brand.";
    return;
  }

  const { currentCalories, goalCalories } = getCalorieTarget(currentWeight, goalWeight, active);
  const wetCalories = calculateWetCalories(wetBrand, wetAmount, wetServingTypeValue);
  const remainingCalories = Math.max(goalCalories - wetCalories, 0);
  const dryFoodAmount = calculateFoodAmounts(selectedBrand, remainingCalories, servingTypeValue);
  const wetSummary = wetAmount > 0 && wetBrand ? `Wet food: ${wetAmount} ${wetServingTypeValue} of ${wetBrand.name} (${formatNumber(wetCalories)} kcal)` : "No wet food entered.";

  const planType = currentWeight > goalWeight ? "weight loss" : currentWeight < goalWeight ? "weight gain" : "maintenance";
  const genderPhrase = gender === "male" ? "male cat" : "female cat";

  let dryMessage = `Feed about <strong>${dryFoodAmount.amount} ${dryFoodAmount.label}</strong> of ${selectedBrandName} per day.`;
  if (remainingCalories === 0 && wetCalories > 0) {
    dryMessage = "The wet food already covers the target calories, so no additional dry food is needed today.";
  }
  if (wetCalories > goalCalories) {
    dryMessage = `Wet food already exceeds the calorie goal by <strong>${formatNumber(wetCalories - goalCalories)} kcal</strong>. No dry food is needed, and consider reducing the wet amount.`;
  }

  resultText.innerHTML = `
    <p>For a <strong>${genderPhrase}</strong> weighing <strong>${currentWeight} lbs</strong> with a goal of <strong>${goalWeight} lbs</strong>:</p>
    <ul>
      <li>Estimated daily goal calories: <strong>${goalCalories} kcal</strong></li>
      <li>Maintenance-level calories: <strong>${currentCalories} kcal</strong></li>
      <li>${wetSummary}</li>
      <li>${dryMessage}</li>
    </ul>
    <p>Use this as a guide and adjust slowly. Check with a veterinarian for a personalized plan.</p>
  `;

  const dryBrandDetail = `
    <div class="brand-tile">
      <h3>${selectedBrand.name} dry food details</h3>
      <p><strong>Calories per cup:</strong> ${selectedBrand.caloriesPerCup}</p>
      <p><strong>Calories per can:</strong> ${selectedBrand.caloriesPerCan}</p>
      <p><strong>Calories per pouch:</strong> ${selectedBrand.caloriesPerPouch}</p>
    </div>
  `;

  const wetBrandDetail = wetAmount > 0 && wetBrand ? `
    <div class="brand-tile">
      <h3>${wetBrand.name} wet food details</h3>
      <p><strong>Calories per can:</strong> ${wetBrand.caloriesPerCan}</p>
      <p><strong>Calories per pouch:</strong> ${wetBrand.caloriesPerPouch}</p>
    </div>
  ` : "";

  brandDetails.innerHTML = dryBrandDetail + wetBrandDetail;
}

populateBrandSelect(brandSelect);
populateBrandSelect(wetBrandSelect);
renderBrandGrid();

document.getElementById("calculatorForm").addEventListener("submit", updateResult);
