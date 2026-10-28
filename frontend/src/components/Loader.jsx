export default function Loader({ text = "Loading..." }) {
  return (
    <div className="text-center py-5">
      <div className="spinner-border text-fs" role="status" />
      <div className="text-muted-space mt-2 small">{text}</div>
    </div>
  );
}
