// Scientific-limitation notice shown on analysis pages and reports
export default function Disclaimer({ compact = false }) {
  return (
    <div className="notice notice-warn">
      <strong>Educational project.</strong> FermiScope uses <strong>simulated data</strong> and simplified
      rules. Results are <strong>preliminary</strong> and do not prove the existence of extraterrestrial
      life. Any "Potential Artificial Signal" is an <strong>UNCONFIRMED CANDIDATE</strong> that requires
      further scientific verification.
      {!compact && (
        <div className="mt-1 text-muted-space">
          Detection (we saw something) → Classification (our rules label it) → Verification (scientists
          confirm it). This app only does the first two.
        </div>
      )}
    </div>
  );
}
