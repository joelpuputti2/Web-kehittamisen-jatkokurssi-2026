import Nav from "../components/Nav"
import Card from "../components/Card"
import Tasks from "../components/Tasks"

const user = {
  name: "Joel",
  tasks: [
    { title: "Tehtävä 1", priority: "high" },
    { title: "Tehtävä 2", priority: "med" },
    { title: "Tehtävä 3", priority: "low" }
  ]
}

function HomePage() {
    return (
        <div className="app-container">
            <Nav/>
            <main className="main-content">
            <div className="header">
                <header>
                    <h1>Tervetuloa takaisin, Joel</h1>
                    <p>Sinulla on 3 palautettavaa tehtävää tänään.</p>
                </header>
            </div>
            <section className="stats-grid">
            <Card title="Työn alla" number="12" />
            <Card title="Tehty" number="5" />
            </section>
            <section className="task-section">
                <h2>Omat tehtävät</h2>
            </section>
            {user.tasks.map((task, index) => (
                <Tasks key={index} title={task.title} priority={task.priority} />
            ))}
            </main>
        </div>
    )
}

export default HomePage