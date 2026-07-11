"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import type { RecipeMatch } from "@/lib/types";

type View = "upload" | "analyzing" | "verify" | "preferences" | "results" | "detail" | "favorites";
type Urgency = "Urgent" | "Soon" | "Fresh";
type Ingredient = { id: number; name: string; quantity: string; days: number; urgency: Urgency; available: boolean };

const initialIngredients: Ingredient[] = [
  { id: 1, name: "Baby spinach", quantity: "1 bag", days: 1, urgency: "Urgent", available: true },
  { id: 2, name: "Cooked chicken", quantity: "250 g", days: 1, urgency: "Urgent", available: true },
  { id: 3, name: "Milk", quantity: "400 ml", days: 3, urgency: "Soon", available: true },
  { id: 4, name: "Eggs", quantity: "6 large", days: 14, urgency: "Fresh", available: true },
  { id: 5, name: "Cheddar", quantity: "150 g", days: 21, urgency: "Fresh", available: true },
  { id: 6, name: "Tomatoes", quantity: "3 medium", days: 4, urgency: "Soon", available: true },
  { id: 7, name: "Bell pepper", quantity: "2", days: 7, urgency: "Fresh", available: true },
  { id: 8, name: "Broccoli", quantity: "1 head", days: 5, urgency: "Soon", available: true },
];

const CUISINES = ["Any", "Italian", "Middle Eastern", "American", "Indian", "Asian", "French", "Mexican", "Mediterranean", "Seafood"];
const COOK_TIME: Record<string, number> = { "Under 15 min": 15, "Under 30 min": 30, "Under 1 hour": 60 };

export default function Home() {
  const [view, setView] = useState<View>("upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [count, setCount] = useState(3);
  const [dietary, setDietary] = useState<string[]>([]);
  const [mealType, setMealType] = useState("Any");
  const [cookTime, setCookTime] = useState("Any");
  const [cuisine, setCuisine] = useState("Any");
  const [recipes, setRecipes] = useState<RecipeMatch[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [relaxed, setRelaxed] = useState(false);
  const [selected, setSelected] = useState<RecipeMatch | null>(null);
  const [saved, setSaved] = useState<number[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  const selectFile = (file?: File) => { if (file?.type.startsWith("image/")) setPreview(URL.createObjectURL(file)); };
  const toggleDiet = (item: string) => setDietary((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);
  const addIngredient = () => setIngredients((current) => [...current, { id: Date.now(), name: "New ingredient", quantity: "1 item", days: 7, urgency: "Fresh", available: true }]);
  const urgentCount = ingredients.filter((ingredient) => ingredient.available && ingredient.urgency === "Urgent").length;
  const startAnalysis = () => { setView("analyzing"); window.setTimeout(() => setView("verify"), 1300); };

  const findRecipes = async () => {
    setView("results");
    setLoadingRecipes(true);
    setRelaxed(false);
    try {
      const payload = {
        ingredients: ingredients.filter((item) => item.available).map((item) => ({ name: item.name, urgency: item.urgency })),
        filters: {
          count,
          diet: dietary,
          exclude: [] as string[],
          category: mealType === "Any" || mealType === "Snacks" ? null : mealType,
          cuisine: cuisine === "Any" ? null : cuisine,
          maxTime: COOK_TIME[cookTime] ?? null,
        },
      };
      const response = await fetch("/api/recipes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      setRecipes(data.recipes ?? []);
      setRelaxed(Boolean(data.relaxed));
    } catch {
      setRecipes([]);
    } finally {
      setLoadingRecipes(false);
    }
  };

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

      {view === "verify" && <section className="content"><div className="stepper"><span className="active">1. Check ingredients</span><i /><span>2. Your preferences</span><i /><span>3. Recipes</span></div><div className="section-heading"><div><p className="eyebrow">HUMAN CHECK</p><h2>Does this look right?</h2><p>We found these in your fridge. Make any changes before we create your recipes.</p></div><button className="secondary" onClick={addIngredient}>+ Add ingredient</button></div><div className="notice">⚑ <span><b>{urgentCount} ingredient{urgentCount === 1 ? "" : "s"} marked urgent.</b> We&apos;ll prioritise them in your recipe matches.</span></div><div className="ingredient-list">{ingredients.map((ingredient) => <div className={`ingredient ${!ingredient.available ? "unavailable" : ""}`} key={ingredient.id}><button className={`check ${ingredient.available ? "checked" : ""}`} onClick={() => setIngredients((all) => all.map((item) => item.id === ingredient.id ? { ...item, available: !item.available } : item))}>✓</button><div className="ingredient-name"><b>{ingredient.name}</b><small>{ingredient.urgency === "Urgent" ? "Use today" : `${ingredient.days} days left`}</small></div><input value={ingredient.quantity} onChange={(event) => setIngredients((all) => all.map((item) => item.id === ingredient.id ? { ...item, quantity: event.target.value } : item))} /><div className="urgency-selector" aria-label={`Set urgency for ${ingredient.name}`}>{(["Urgent", "Soon", "Fresh"] as Urgency[]).map((urgency) => <button key={urgency} className={ingredient.urgency === urgency ? `selected ${urgency.toLowerCase()}` : ""} onClick={() => setIngredients((all) => all.map((item) => item.id === ingredient.id ? { ...item, urgency } : item))}>{urgency}</button>)}</div><button className="delete" onClick={() => setIngredients((all) => all.filter((item) => item.id !== ingredient.id))}>×</button></div>)}</div><div className="footer-actions"><button className="text-button" onClick={() => setView("upload")}>← Start over</button><button className="primary" onClick={() => setView("preferences")}>Continue to preferences →</button></div></section>}

      {view === "preferences" && <section className="content narrow"><div className="stepper"><span>1. Check ingredients</span><i /><span className="active">2. Your preferences</span><i /><span>3. Recipes</span></div><p className="eyebrow">MAKE IT YOURS</p><h2>What are you in the mood for?</h2><p className="lead">We&apos;ll use these to tailor your recipe matches.</p><div className="preference"><label>Number of recipes</label><div className="segmented">{[3, 5, 10].map((number) => <button key={number} className={count === number ? "selected" : ""} onClick={() => setCount(number)}>{number} recipes</button>)}</div></div><div className="preference"><label>Dietary requirements</label><div className="chips">{["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "High-protein", "Low-carb"].map((item) => <button key={item} className={dietary.includes(item) ? "selected" : ""} onClick={() => toggleDiet(item)}>{dietary.includes(item) ? "✓ " : "+ "}{item}</button>)}</div></div><div className="preference grid-preferences"><div><label>Meal type</label><select value={mealType} onChange={(event) => setMealType(event.target.value)}><option>Any</option><option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snacks</option></select></div><div><label>Cooking time</label><select value={cookTime} onChange={(event) => setCookTime(event.target.value)}><option>Any</option><option>Under 15 min</option><option>Under 30 min</option><option>Under 1 hour</option></select></div><div><label>Cuisine</label><select value={cuisine} onChange={(event) => setCuisine(event.target.value)}>{CUISINES.map((option) => <option key={option}>{option}</option>)}</select></div></div><div className="footer-actions"><button className="text-button" onClick={() => setView("verify")}>← Back</button><button className="primary" onClick={findRecipes}>Find my recipes →</button></div></section>}

      {view === "results" && <section className="content"><div className="stepper"><span>1. Check ingredients</span><i /><span>2. Your preferences</span><i /><span className="active">3. Recipes</span></div><p className="eyebrow">YOUR BEST MATCHES</p><h2>Cook something brilliant.</h2><p className="lead">Ranked to use what&apos;s already in your fridge — especially the ingredients that need you most.</p>{relaxed && recipes.length > 0 && <div className="notice">⚑ <span>No recipe matched every filter — here are your closest options.</span></div>}{loadingRecipes ? <div className="empty">✦<h3>Finding your best matches…</h3><p>Ranking recipes by what needs using first.</p></div> : recipes.length === 0 ? <div className="empty">◌<h3>No matches yet</h3><p>Try removing a filter or adding a few more ingredients.</p><button className="primary" onClick={() => setView("preferences")}>Edit preferences</button></div> : <div className="recipe-grid">{recipes.map((recipe) => <article className="recipe-card" key={recipe.id} onClick={() => { setSelected(recipe); setView("detail"); }}><img src={recipe.image} alt="" /><div className="score">{recipe.score}% match</div><div className="card-body"><div className="tags">{recipe.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}</div><h3>{recipe.name}</h3><p>◷ {recipe.time} min &nbsp; · &nbsp; ★ 4.8</p><div className="uses">✓ Uses {recipe.used.length} fridge ingredients</div></div></article>)}</div>}<div className="footer-actions"><button className="text-button" onClick={() => setView("preferences")}>← Edit preferences</button></div></section>}

      {view === "detail" && selected && <section className="content detail"><button className="text-button" onClick={() => setView("results")}>← Back to recipes</button><img className="hero-image" src={selected.image} alt="" /><div className="detail-title"><div><div className="tags">{selected.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><h2>{selected.name}</h2><p>◷ {selected.time} min &nbsp; · &nbsp; Easy &nbsp; · &nbsp; ★ 4.8 &nbsp; · &nbsp; 4 servings</p></div><button className={`save ${saved.includes(selected.id) ? "saved" : ""}`} onClick={() => setSaved((all) => all.includes(selected.id) ? all.filter((id) => id !== selected.id) : [...all, selected.id])}>{saved.includes(selected.id) ? "♥ Saved" : "♡ Save recipe"}</button></div><div className="detail-grid"><div><h3>Instructions</h3><ol>{selected.steps.map((step, index) => <li key={step}><b>{index + 1}</b><p>{step}</p></li>)}</ol></div><aside><h3>Nutrition <small>per serving</small></h3><div className="nutrition"><b>{selected.calories}<small> kcal</small></b><div><span>Protein <strong>{selected.protein}g</strong></span><span>Carbs <strong>{selected.carbs}g</strong></span><span>Fat <strong>{selected.fat}g</strong></span></div></div><hr /><h3>Ingredients</h3><p className="have">YOU HAVE</p>{selected.used.map((item) => <p className="item" key={item}>✓ {item}</p>)}{selected.missing.length > 0 && <><p className="need">SHOPPING LIST</p>{selected.missing.map((item) => <p className="item" key={item}>⊙ {item}</p>)}</>}</aside></div></section>}

      {view === "favorites" && <section className="content"><p className="eyebrow">YOUR COLLECTION</p><h2>Favourite recipes</h2><p className="lead">{saved.length ? "Recipes you saved for another delicious day." : "Save recipes you love and they’ll live here."}</p>{saved.length ? <div className="recipe-grid">{recipes.filter((recipe) => saved.includes(recipe.id)).map((recipe) => <article className="recipe-card" key={recipe.id} onClick={() => { setSelected(recipe); setView("detail"); }}><img src={recipe.image} alt="" /><div className="card-body"><h3>{recipe.name}</h3><p>◷ {recipe.time} min</p></div></article>)}</div> : <div className="empty">♡<h3>No favourites yet</h3><p>Tap the heart on a recipe to save it here.</p><button className="primary" onClick={() => setView("results")}>Explore recipes</button></div>}</section>}
    </main>
  );
}
