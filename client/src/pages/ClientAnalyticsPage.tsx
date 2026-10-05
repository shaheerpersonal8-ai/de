export default function ClientReviewsPage() {
  return (
    <div className="page-stack">
      <section className="panel">
        <p className="eyebrow">Client pending reviews</p>
        <h1>Reviews</h1>
        <ul className="list-stack">
          <li>AI evaluation in progress — UI handoff</li>
          <li>Needs Review — mobile layout</li>
          <li>Release ready — asset package</li>
        </ul>
      </section>
    </div>
  );
}
