"use client";

import { ChangeEvent, DragEvent, useMemo, useRef, useState } from "react";

type View = "upload" | "analyzing" | "verify" | "preferences" | "results" | "detail" | "favorites";
type Ingredient = { id: number; name: string; quantity: string; days: number; urgent: boolean; available: boolean };
type Recipe = { id: number; name: string; image: string; time: number; score: number; tags: string[]; used: string[]; missing: string[]; calories: number; protein: number; carbs: number; fat: number; steps: string[] };

const initialIngredients: Ingredient[] = [
  { id: 1, name: "Baby spinach", quantity: "1 bag", days: 1, urgent: true, available: true },
  { id: 2, name: "Cooked chicken", quantity: "250 g", days: 1, urgent: true, available: true },
  { id: 3, name: "Milk", quantity: "400 ml", days: 3, urgent: false, available: true },
  { id: 4, name: "Eggs", quantity: "6 large", days: 14, urgent: false, available: true },
  { id: 5, name: "Cheddar", quantity: "150 g", days: 21, urgent: false, available: true },
  { id: 6, name: "Tomatoes", quantity: "3 medium", days: 4, urgent: false, available: true },
  { id: 7, name: "Bell pepper", quantity: "2", days: 7, urgent: false, available: true },
  { id: 8, name: "Broccoli", quantity: "1 head", days: 5, urgent: false, available: true },
];

const recipes: Recipe[] = [
  { id: 1, name: "Chicken & Spinach Frittata", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=80", time: 25, score: 96, tags: ["High protein", "Low carb", "Gluten free"], used: ["Baby spinach", "Cooked chicken", "Eggs", "Cheddar"], missing: [], calories: 342, protein: 29, carbs: 6, fat: 22, steps: ["Heat a large oven-safe pan and soften the onion with garlic.", "Add chicken and spinach, cooking until the leaves have wilted.", "Whisk the eggs with seasoning and half the cheddar, then pour into the pan.", "Top with the remaining cheese and bake until golden and just set."] },
  { id: 2, name: "Garden Shakshuka", image: "https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&w=1000&q=80", time: 20, score: 88, tags: ["Vegetarian", "One pan"], used: ["Baby spinach", "Eggs", "Tomatoes", "Bell pepper"], missing: ["Cumin", "Smoked paprika"], calories: 218, protein: 14, carbs: 18, fat: 10, steps: ["Cook onion and bell pepper until soft.", "Simmer tomatoes with cumin and smoked paprika.", "Fold in spinach, then make wells in the sauce.", "Crack in the eggs, cover, and cook until the whites are set."] },
  { id: 3, name: "Broccoli Cheddar Soup", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1000&q=80", time: 30, score: 82, tags: ["Comfort food", "Vegetarian"], used: ["Broccoli", "Cheddar", "Milk"], missing: ["Vegetable stock"], calories: 285, protein: 16, carbs: 19, fat: 16, steps: ["Sauté onion and garlic in butter.", "Add chopped broccoli and stock, simmering until tender.", "Blend until silky, leaving some texture if desired.", "Stir through milk and cheese over low heat before serving."] },
];

export default function Home() {
  const [view, setView] = useState<View>("upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [count, setCount] = useState(3);
  const [dietary, setDietary] = useState<string[]>([]);
  const [selected, setSelected] = useState(recipes[0]);
  const [saved, setSaved] = useState<number[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  const visibleRecipes = useMemo(() => recipes.slice(0, count), [count]);
  const selectFile = (file?: File) => { if (file?.type.startsWith("image/")) setPreview(URL.createObjectURL(file)); };
  const toggleDiet = (item: string) => setDietary((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);
  const addIngredient = () => setIngredients((current) => [...current, { id: Date.now(), name: "New ingredient", quantity: "1 item", days: 7, urgent: false, available: true }]);
  const startAnalysis = () => { setView("analyzing"); window.setTimeout(() => setView("verify"), 1300); };

  return (
    <main>
      <header className="topbar">
        <button className="brand" onClick={() => setView("upload")}><span>✦</span> PrepFridge</button>
        <nav><button onClick={() => setView("favorites")}>♡ Favourites</button><button className="impact">◌ My impact</button></nav>
      </header>

      {view === "upload" && <section className="upload-page">
        <p className="eyebrow">YOUR KITCHEN, MADE EASIER</p>
        <h1>What&apos;s in your fridge<br /><em>today?</em></h1>
        <p className="intro">Turn the ingredients you already have into something delicious. Less waste, more good food.</p>
        <div className={`dropzone ${dragging ? "dragging" : ""} ${preview ? "has-preview" : ""}`} onClick={() => fileInput.current?.click()} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event: DragEvent) => { event.preventDefault(); setDragging(false); selectFile(event.dataTransfer.files[0]); }}>
          <input ref={fileInput} type="file" accept="image/*" onChange={(event: ChangeEvent<HTMLInputElement>) => selectFile(event.target.files?.[0])} />
          {preview ? <><img src={preview} alt="Your fridge upload" /><span className="ready">✓ Photo ready — click to change</span></> : <><div className="camera">⌑</div><strong>Drop your fridge photo here</strong><span>or click to browse your device</span><small>JPG &nbsp; PNG &nbsp; HEIC · up to 20 MB</small></>}
        </div>
        <div className="or"><span />or try with a demo fridge<span /></div>
        <div className="upload-actions"><button className="secondary" onClick={startAnalysis}>♨ Use demo fridge</button><button className="primary" onClick={startAnalysis}>Turn into recipe <b>→</b></button></div>
      </section>}

      {view === "analyzing" && <section className="analyzing"><div className="pulse">✦</div><p className="eyebrow">AI VISION AT WORK</p><h1>Looking inside your fridge…</h1><p>Identifying ingredients, quantities, and the things that need using soon.</p><div className="progress"><i /></div></section>}

      {view === "verify" && <section className="content"><div className="stepper"><span className="active">1. Check ingredients</span><i /><span>2. Your preferences</span><i /><span>3. Recipes</span></div><div className="section-heading"><div><p className="eyebrow">HUMAN CHECK</p><h2>Does this look right?</h2><p>We found these in your fridge. Make any changes before we create your recipes.</p></div><button className="secondary" onClick={addIngredient}>+ Add ingredient</button></div><div className="notice">⚑ <span><b>2 ingredients need using today.</b> We&apos;ll prioritise them in your recipe matches.</span></div><div className="ingredient-list">{ingredients.map((ingredient) => <div className={`ingredient ${!ingredient.available ? "unavailable" : ""}`} key={ingredient.id}><button className={`check ${ingredient.available ? "checked" : ""}`} onClick={() => setIngredients((all) => all.map((item) => item.id === ingredient.id ? { ...item, available: !item.available } : item))}>✓</button><div className="ingredient-name"><b>{ingredient.name}</b><small>{ingredient.urgent ? "Use today" : `${ingredient.days} days left`}</small></div><input value={ingredient.quantity} onChange={(event) => setIngredients((all) => all.map((item) => item.id === ingredient.id ? { ...item, quantity: event.target.value } : item))} /><button className={`urgency ${ingredient.urgent ? "urgent" : ""}`} onClick={() => setIngredients((all) => all.map((item) => item.id === ingredient.id ? { ...item, urgent: !item.urgent } : item))}>{ingredient.urgent ? "Use soon" : "Fresh"}</button><button className="delete" onClick={() => setIngredients((all) => all.filter((item) => item.id !== ingredient.id))}>×</button></div>)}</div><div className="footer-actions"><button className="text-button" onClick={() => setView("upload")}>← Start over</button><button className="primary" onClick={() => setView("preferences")}>Continue to preferences →</button></div></section>}

      {view === "preferences" && <section className="content narrow"><div className="stepper"><span>1. Check ingredients</span><i /><span className="active">2. Your preferences</span><i /><span>3. Recipes</span></div><p className="eyebrow">MAKE IT YOURS</p><h2>What are you in the mood for?</h2><p className="lead">We&apos;ll use these to tailor your recipe matches.</p><div className="preference"><label>Number of recipes</label><div className="segmented">{[3, 5, 10].map((number) => <button key={number} className={count === number ? "selected" : ""} onClick={() => setCount(number)}>{number} recipes</button>)}</div></div><div className="preference"><label>Dietary requirements</label><div className="chips">{["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "High-protein", "Low-carb"].map((item) => <button key={item} className={dietary.includes(item) ? "selected" : ""} onClick={() => toggleDiet(item)}>{dietary.includes(item) ? "✓ " : "+ "}{item}</button>)}</div></div><div className="preference grid-preferences"><div><label>Meal type</label><select defaultValue="Dinner"><option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snacks</option></select></div><div><label>Cooking time</label><select defaultValue="Under 30 min"><option>Under 15 min</option><option>Under 30 min</option><option>Under 1 hour</option></select></div></div><div className="footer-actions"><button className="text-button" onClick={() => setView("verify")}>← Back</button><button className="primary" onClick={() => setView("results")}>Find my recipes →</button></div></section>}

      {view === "results" && <section className="content"><div className="stepper"><span>1. Check ingredients</span><i /><span>2. Your preferences</span><i /><span className="active">3. Recipes</span></div><p className="eyebrow">YOUR BEST MATCHES</p><h2>Cook something brilliant.</h2><p className="lead">Ranked to use what&apos;s already in your fridge — especially the ingredients that need you most.</p><div className="recipe-grid">{visibleRecipes.map((recipe) => <article className="recipe-card" key={recipe.id} onClick={() => { setSelected(recipe); setView("detail"); }}><img src={recipe.image} alt="" /><div className="score">{recipe.score}% match</div><div className="card-body"><div className="tags">{recipe.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}</div><h3>{recipe.name}</h3><p>◷ {recipe.time} min &nbsp; · &nbsp; ★ 4.8</p><div className="uses">✓ Uses {recipe.used.length} fridge ingredients</div></div></article>)}</div><div className="footer-actions"><button className="text-button" onClick={() => setView("preferences")}>← Edit preferences</button></div></section>}

      {view === "detail" && <section className="content detail"><button className="text-button" onClick={() => setView("results")}>← Back to recipes</button><img className="hero-image" src={selected.image} alt="" /><div className="detail-title"><div><div className="tags">{selected.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><h2>{selected.name}</h2><p>◷ {selected.time} min &nbsp; · &nbsp; Easy &nbsp; · &nbsp; ★ 4.8 &nbsp; · &nbsp; 4 servings</p></div><button className={`save ${saved.includes(selected.id) ? "saved" : ""}`} onClick={() => setSaved((all) => all.includes(selected.id) ? all.filter((id) => id !== selected.id) : [...all, selected.id])}>{saved.includes(selected.id) ? "♥ Saved" : "♡ Save recipe"}</button></div><div className="detail-grid"><div><h3>Instructions</h3><ol>{selected.steps.map((step, index) => <li key={step}><b>{index + 1}</b><p>{step}</p></li>)}</ol></div><aside><h3>Nutrition <small>per serving</small></h3><div className="nutrition"><b>{selected.calories}<small> kcal</small></b><div><span>Protein <strong>{selected.protein}g</strong></span><span>Carbs <strong>{selected.carbs}g</strong></span><span>Fat <strong>{selected.fat}g</strong></span></div></div><hr /><h3>Ingredients</h3><p className="have">YOU HAVE</p>{selected.used.map((item) => <p className="item" key={item}>✓ {item}</p>)}{selected.missing.length > 0 && <><p className="need">SHOPPING LIST</p>{selected.missing.map((item) => <p className="item" key={item}>⊙ {item}</p>)}</>}</aside></div></section>}

      {view === "favorites" && <section className="content"><p className="eyebrow">YOUR COLLECTION</p><h2>Favourite recipes</h2><p className="lead">{saved.length ? "Recipes you saved for another delicious day." : "Save recipes you love and they’ll live here."}</p>{saved.length ? <div className="recipe-grid">{recipes.filter((recipe) => saved.includes(recipe.id)).map((recipe) => <article className="recipe-card" key={recipe.id} onClick={() => { setSelected(recipe); setView("detail"); }}><img src={recipe.image} alt="" /><div className="card-body"><h3>{recipe.name}</h3><p>◷ {recipe.time} min</p></div></article>)}</div> : <div className="empty">♡<h3>No favourites yet</h3><p>Tap the heart on a recipe to save it here.</p><button className="primary" onClick={() => setView("results")}>Explore recipes</button></div>}</section>}
    </main>
  );
}
