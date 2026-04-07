const Card = (props) => {
  return (
      <div className="card">
        <h3>{props.title}</h3>
        <p className="stat-number">{props.number}</p>
      </div>
  )
}

export default Card;