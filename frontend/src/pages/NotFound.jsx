import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container py-5 text-center">
      <h1 className="display-3 gradient-text fw-bold">404</h1>
      <p className="text-muted-space">This page drifted out of range. Nothing was detected here.</p>
      <Link to="/" className="btn btn-fs">Back to home</Link>
    </div>
  );
}
