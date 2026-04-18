import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import Card from "../components/Card";
import Tasks from "../components/Tasks";

function HomePage() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchTasks() {
            try {
                const response = await fetch("/api/tasks");

                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }

                const data = await response.json();
                setTasks(data);
            } catch (fetchError) {
                console.error(fetchError);
                setError("Tehtavien haku epaonnistui.");
            } finally {
                setLoading(false);
            }
        }

        fetchTasks();
    }, []);

    const completedCount = 0;
    const inProgressCount = tasks.length;

    return (
        <div className="app-container">
            <Nav/>
            <main className="main-content">
            <div className="header">
                <header>
                    <h1>Tervetuloa takaisin</h1>
                    <p>Sinulla on {tasks.length} palautettavaa tehtavaa tanaan.</p>
                </header>
            </div>
            <section className="stats-grid">
            <Card title="Tyon alla" number={String(inProgressCount)} />
            <Card title="Tehty" number={String(completedCount)} />
            </section>
            <section className="task-section">
                <h2>Omat tehtävät</h2>
            </section>
            {loading && <p>Haetaan tehtavia...</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && !error && tasks.map((task) => (
                <Tasks key={task.id} title={task.task_name} priority={task.priority} />
            ))}
            </main>
        </div>
    )
}

export default HomePage