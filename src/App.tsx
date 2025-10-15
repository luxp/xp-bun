import "./index.css";
import { callApi } from "./api/call";

export function App() {
  return (
    <div className="app">
      <button
        onClick={async () => {
          const result = await callApi("test2", { name: "John" });
          console.log(result);
        }}
      >
        adfafa
      </button>
    </div>
  );
}

export default App;
