import { useEffect, useState } from "react";
import "./style.css";
import supabase from "./supabase";

// const initialFacts = [
//   {
//     id: 1,
//     text: "React is being developed by Meta (formerly facebook)",
//     source: "https://opensource.fb.com/",
//     category: "technology",
//     votesInteresting: 24,
//     votesMindblowing: 9,
//     votesFalse: 4,
//     createdIn: 2021,
//   },
//   {
//     id: 2,
//     text: "Millennial dads spend 3 times as much time with their kids than their fathers spent with them. In 1982, 43% of fathers had never changed a diaper. Today, that number is down to 3%",
//     source:
//       "https://www.mother.ly/parenting/millennial-dads-spend-more-time-with-their-kids",
//     category: "society",
//     votesInteresting: 11,
//     votesMindblowing: 2,
//     votesFalse: 0,
//     createdIn: 2019,
//   },
//   {
//     id: 3,
//     text: "Lisbon is the capital of Portugal",
//     source: "https://en.wikipedia.org/wiki/Lisbon",
//     category: "society",
//     votesInteresting: 8,
//     votesMindblowing: 3,
//     votesFalse: 1,
//     createdIn: 2015,
//   },
// ];

// ROOT APP
function App() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");

  useEffect(
    function () {
      async function getFacts() {
        setLoading(true);

        let query = supabase.from("facts").select("*");

        if (currentCategory !== "all")
          query = query.eq("category", currentCategory);

        const { data: facts, error } = await query;

        error
          ? alert("There is some problem getting the data.")
          : setFacts(facts);
        setLoading(false);
      }
      getFacts();
    },
    [currentCategory]
  );

  return (
    <>
      <Header showForm={showForm} setShowForm={setShowForm} />

      {showForm ? (
        <FactForm setShowForm={setShowForm} setFacts={setFacts} />
      ) : null}

      <main className="main">
        <CategoryFilter setCurrentCategory={setCurrentCategory} />

        {loading ? <Loader /> : <FactList facts={facts} setFacts={setFacts} />}
      </main>
    </>
  );
}

// LOADING FUNCTION
function Loader() {
  return <p className="loading">Loading...</p>;
}

// HEADER SECTION
function Header(props) {
  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" alt="Today I Learned Logo" />
        <h1>Today I Learned!</h1>
      </div>
      <button
        className="btn btn-large btn-share"
        onClick={() => props.setShowForm((event) => !event)}
      >
        {props.showForm ? "Close" : "Share a fact"}
      </button>
    </header>
  );
}

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

// ASIDE SECTION -> CATEGORY FILTER
function CategoryFilter({ setCurrentCategory }) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCategory("all")}
          >
            All
          </button>
        </li>
        {CATEGORIES.map((cat) => (
          <li key={cat.name} className="category">
            <button
              className="btn btn-category"
              onClick={() => setCurrentCategory(cat.name)}
              style={{ backgroundColor: cat.color }}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

// FUNCTION TO CHECK VALIDATION OF A URL
function validURL(str) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(str);
}

// 'POST FACT' FORM SECTION
function FactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const textLength = text.length;
  const [factPosting, setFactPosting] = useState(false);

  async function handleSubmit(e) {
    // 1. Prevent Browser Reload
    e.preventDefault();
    console.log(text, category, source);

    // 2. Check if data is valid. If so, create new fact.

    if (text && validURL(source) && category && textLength <= 200) {
      // 3. Create a new fact object
      //   const newfact = {
      //     id: 2,
      //     text,
      //     source,
      //     category,
      //     votesInteresting: 0,
      //     votesMindblowing: 0,
      //     votesFalse: 0,
      //     createdIn: new Date().getFullYear(),
      //   };

      // 3.1 Create new fact object, upload it to supabase & add the new fact into the state
      setFactPosting(true);
      const { data: newFact, error } = await supabase
        .from("facts")
        .insert([{ text, source, category }])
        .select();

      // 4. Add the new fact to the UI: add the fact to state.
      if (!error) setFacts((facts) => [newFact[0], ...facts]);

      // 5. Reset the input field
      setText("");
      setSource("");
      setCategory("");
      setFactPosting(false);

      // 6. Close the form.
      setShowForm(false);
    }
  }

  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Share a fact with the world"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={factPosting}
      />
      <span>{200 - textLength}</span>
      <input
        type="text"
        placeholder="Trustworthy source"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        disabled={factPosting}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={factPosting}
      >
        <option value="">Choose category:</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className="btn btn-large" type="submit" disabled={factPosting}>
        Post
      </button>
    </form>
  );
}

// ENTIRE FACTLIST FROM SUPABASE
function FactList({ facts, setFacts }) {
  if (facts.length === 0) {
    return (
      <p className="loading">
        No facts for this category yet! Create the first one 🤌🏼
      </p>
    );
  }
  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact key={fact.id} fact={fact} setFacts={setFacts}></Fact>
        ))}
      </ul>
    </section>
  );
}

// SINGLE FACT SECTION
function Fact({ fact, setFacts }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isDisputed = fact.votesLike + fact.votesMindBlowing < fact.votesFalse;

  async function handleVotes(columnName) {
    setIsUpdating(true);
    const { data: updatedFact, error } = await supabase
      .from("facts")
      .update({ [columnName]: fact[columnName] + 1 })
      .eq("id", fact.id)
      .select();

    setIsUpdating(false);

    if (!error)
      setFacts((facts) =>
        facts.map((f) => (f.id === fact.id ? updatedFact[0] : f))
      );
  }

  return (
    <li key={fact.id} className="fact">
      <p>
        {isDisputed ? <span className="disputed">⛔[DISPUTED]</span> : null}
        {fact.text}
        <a
          className="source"
          href={fact.source}
          rel="noopener noreferrer"
          target="_blank"
        >
          (Source)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find((cat) => cat.name === fact.category)
            .color,
        }}
      >
        {fact.category}
      </span>
      <div className="vote-buttons">
        <button onClick={() => handleVotes("votesLike")} disabled={isUpdating}>
          👍 {fact.votesLike}
        </button>
        <button
          onClick={() => handleVotes("votesMindBlowing")}
          disabled={isUpdating}
        >
          🤯 {fact.votesMindBlowing}
        </button>
        <button onClick={() => handleVotes("votesFalse")} disabled={isUpdating}>
          ⛔️ {fact.votesFalse}
        </button>
      </div>
    </li>
  );
}

export default App;
