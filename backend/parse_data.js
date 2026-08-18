const fs = require('fs');

const rawData = `
Banana Family
Banana Flower
1 pc, Rs. 40.00

Banana Flower (Cleaned)
1 pc, Rs. 60.00

Banana Stem
1 pc, Rs. 40.00

Raw Banana / Vazhakkai
1 pc, Rs. 29.00

Banana Stem (Clean And Cut)
1 pcs, Rs. 60.00

Beans Family
Cluster Beans
250 g, Rs. 40.00

Ring Beans / Bush Beans
250 g, Rs. 50.00

Brinjal Family
Bottle Brinjal
500 g, Rs. 65.00

Brinjal Purple
250 g, Rs. 22.50

Ladies Finger
250 g, Rs. 27.50

Cabbage Allied
Broccoli
250 g, Rs. 62.50

Cabbage Green
250 g, Rs. 27.50

Cabbage Red
250 g, Rs. 32.50

Cauliflower Big
1 pcs, Rs. 95.00

Cauliflower Medium
1 pcs, Rs. 80.00

Radish Red
250 g, Rs. 20.00

Radish White
250 g, Rs. 20.00

Chillies
Capsicum Green
250 g, Rs. 62.50

Capsicum Red
250 g, Rs. 100.00

Capsicum Yellow
250 g, Rs. 100.00

Green Chilly
100 g, Rs. 16.00

Coconut
Coconut Big
1 pc, Rs. 60.00

Coconut Small
1 pc, Rs. 45.00

Dry Coconut
1 pcs, Rs. 110.00

Grated Coconut
1 pack, Rs. 90.00

Corns And Allied
Sweet Potato
500 g, Rs. 47.50

Baby Corn
1 pack, Rs. 60.00

Sweet Corn
1 pc, Rs. 50.00

Dried Veggies
Dry Bitter Gourd
50 g, Rs. 60.00

Dry Brinjal
100 g, Rs. 120.00

Dry Capsicum
100 g, Rs. 180.00

Dry Cluster Beans
100 g, Rs. 150.00

Dry Ladies Finger
100 g, Rs. 140.00

Dry Sweet Potato Chips
100 g, Rs. 110.00

Dry Tomato
50 g, Rs. 60.00

Vadagam - Thalipu
6 pcs, Rs. 180.00

Drypotato Chips
100 g, Rs. 190.00

Gourds
Bitter Gourd
250 g, Rs. 25.00

Bottle Gourd
750 g, Rs. 67.50

Chow Chow
250 g, Rs. 23.75

Cucumber
250 g, Rs. 22.50

Kovakkai
250 g, Rs. 25.00

Malabar / Saambar Cucumber
500 g, Rs. 35.00

Pumpkin
250 g, Rs. 18.75

Ridge Gourd
250 g, Rs. 32.50

Snake Gourd Short
250 g, Rs. 18.75

Mango
Raw Mango
500 g, Rs. 45.00

Onion / Garlic Allied
Fresh Raw Turmeric
250 g, Rs. 47.50

Garlic
100 g, Rs. 36.00

Garlic Hill / Malai Pundu
100 g, Rs. 40.00

Garlic Nati / Nattu Poondu
100 g, Rs. 33.00

Ginger
100 g, Rs. 38.00

Ginger Garlic Paste
200 g, Rs. 160.00

Lemon
1 pc, Rs. 15.00

Lemon Pickle
250 g, Rs. 300.00

Onion
1 kg, Rs. 95.00

Small Onion / Sambar Onion
250 g, Rs. 50.00

Others
Garlic Powder
1 kg, Rs. 1,200.00

Powders
Onion Powder
200 g, Rs. 160.00

Roots
Baby Potato
250 g, Rs. 20.00

Beet Root Ooty
250 g, Rs. 45.00

Carrot Ooty
250 g, Rs. 50.00

Colocasia / Sepakazhangu
250 g, Rs. 37.50

Elephant Yam / Karunaikizhangu
250 g, Rs. 35.00

Potato Ooty
500 g, Rs. 65.00

Tomatoes
Tomato Hybrid
500 g, Rs. 42.50

Tomato Local
500 g, Rs. 35.00

Vegetables
Ash Gourd/pumpkin White
250 g, Rs. 20.00

Bananas
Banana Yelakki
500 g, Rs. 85.00

Dried Fruits
Dry Amla
500 g, Rs. 499.50

Exotic
Apple
500 g, Rs. 280.00

Avocado / Butter Fruit
250 g, Rs. 90.00

Pomegranate
500 g, Rs. 290.00

Rambutan
250 g, Rs. 137.50

Fruit Bowl
Fruit Basket
1 pack, Rs. 1,000.00

Mixed Cut Fruit -fresh
1 box, Rs. 80.00

Fruits Bowl
Watermelon Cut Fruits - 250 Gm
1 box, Rs. 45.00

Generic
Muskmelon
750 g, Rs. 67.50

Juice
Pomegranate Juice-250 Ml
1 bottle, Rs. 100.00

Juices
Mango Juice 250 Ml
1 bottle, Rs. 50.00

Muskmelon Juice (250 Ml)
1 bottle, Rs. 40.00

Pineapple Juice-500 Ml
1 bottle, Rs. 90.00

Watermelon Juice- 250 Ml
1 bottle, Rs. 45.00

Apple Juice - 250 Ml
1 bottle, Rs. 150.00

Local
Guava - White
500 g, Rs. 90.00

Papaya
750 g, Rs. 67.50

Papaya Cut Fruits- 250 Gm
1 box, Rs. 40.00

Pineappe Cut Fruits- 250 Ml
1 box, Rs. 60.00

Pomegranare Cut Fruits- 150 Gm
1 box, Rs. 80.00

Watermelon Kiran
2.5 kg, Rs. 175.00

Mangoes
Mango Banganapalli
1 kg, Rs. 170.00

Mango Banganapalli @ 5kg
1 set, Rs. 750.00

Mango Banganapalli @ 3 Kg
1 set, Rs. 450.00

Milk Shake
Banana Milkshake-200 Ml
1 bottle, Rs. 40.00

Others
Apple Cut Fruits -150 Gm
1 box, Rs. 80.00

Fresh Juice-mango-250 Ml
1 bottle, Rs. 60.00

Mangosteen
1 kg, Rs. 580.00

Pickles( No Veniger)
Amla Pickle
100 g, Rs. 120.00

Powders
Amla Powder
100 g, Rs. 120.00

Spreads
Apple Spread
100 g, Rs. 250.00

Mango Jam 200 Gm
1 bottle, Rs. 300.00

Mango Jam 350 Gm
1 bottle, Rs. 400.00

Mixed Fruit Jam
150 g, Rs. 270.00

Pomegranate Jam
100 g, Rs. 200.00

Citrus Marmalade
100 g, Rs. 250.00
`;

const lines = rawData.split('\n').map(l => l.trim()).filter(l => l);

const products = [];
let currentSubCategory = '';
let currentName = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Subcategory vs Product Name vs Price/Weight
  if (line.includes('Rs.')) {
    // It's a price/weight line
    const parts = line.split(', Rs.');
    if (parts.length === 2 && currentName) {
      const weight = parts[0].trim();
      const price = parseFloat(parts[1].trim());
      
      let categoryName = "Vegetables";
      const fruitsCats = ["Bananas", "Dried Fruits", "Exotic", "Fruit Bowl", "Fruits Bowl", "Generic", "Juice", "Juices", "Local", "Mangoes", "Milk Shake"];
      if (fruitsCats.includes(currentSubCategory)) categoryName = "Fruits";
      if (currentSubCategory === "Spreads" || currentSubCategory === "Pickles( No Veniger)" || currentSubCategory === "Powders") categoryName = "Groceries";

      products.push({
        name: currentName,
        price,
        weight,
        subCategory: currentSubCategory,
        categoryName,
        stock: 50,
        description: "Farm fresh organic produce.",
        images: ["https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop"],
        isOrganic: true
      });
      currentName = '';
    }
  } else {
    // If it's not a price line, it could be a subcategory or product name.
    // If the next line is NOT a price line, this line is a subcategory, and the next line is a product name.
    // If the next line IS a price line, this line is a product name.
    if (i + 1 < lines.length && lines[i+1].includes('Rs.')) {
      currentName = line;
    } else {
      currentSubCategory = line;
    }
  }
}

fs.writeFileSync('parsed_products.json', JSON.stringify(products, null, 2));
console.log('Parsed ' + products.length + ' products.');
