const priority = {
  high: { className: "high", title: "Korkea" },
  med: { className: "med", title: "Keskitaso" },
  low: { className: "low", title: "Matala" }
}

const Tasks = (props) => {
  return (
      <div className="task-item">
        <input type="checkbox" />
        <span>{props.title}</span>
        <span className={`tag ${priority[props.priority].className}`}>{priority[props.priority].title}</span>
      </div>
  )
}

export default Tasks;