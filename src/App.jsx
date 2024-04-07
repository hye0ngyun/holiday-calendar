import Calendar from "./components/calendar";

function MyButton({ title, disabled }) {
  return <button disabled={disabled}>{title}</button>;
}

export default function App() {
  return (
    <div>
      <h1>Welcome to my app</h1>
      <MyButton title="I'm a disabled button" disabled={true} />
      <Calendar />
    </div>
  );
}
