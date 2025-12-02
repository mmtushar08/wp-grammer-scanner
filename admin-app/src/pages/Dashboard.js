import React, { useEffect, useState } from "react";

const Dashboard = () => {
  const [reports, setReports] = useState([]);
  const [loadingScan, setLoadingScan] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [error, setError] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const restBase =
    (window.WP_GS_DATA && window.WP_GS_DATA.restUrl) || "/wp-json/wp-gs/v1/";
  const nonce = window.WP_GS_DATA ? window.WP_GS_DATA.nonce : "";

  const fetchReports = async () => {
    setLoadingReports(true);
    setError("");

    try {
      const res = await fetch(restBase + "reports", {
        credentials: "same-origin",
        headers: {
          "X-WP-Nonce": nonce,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      // API returns array of reports
      setReports(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error fetching reports", e);
      setError("Error loading reports.");
    } finally {
      setLoadingReports(false);
    }
  };

  const runScan = async () => {
    setLoadingScan(true);
    setError("");

    try {
      const res = await fetch(restBase + "scan", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-WP-Nonce": nonce,
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        console.error("Scan failed", data);
        setError("Scan failed. Check debug.log for details.");
      } else {
        alert(
          `Scan completed. Issues found: ${data.issues_count ?? data.issues?.length ?? 0
          }`
        );
        fetchReports();
      }
    } catch (e) {
      console.error("Error running scan", e);
      setError("Scan failed. Check debug.log for details.");
    } finally {
      setLoadingScan(false);
    }
  };

  // client-side date filter
  const filteredReports = reports.filter((r) => {
    if (!fromDate && !toDate) return true;
    if (!r.created_at) return true; // if date missing, don't hide it

    const d = new Date(r.created_at); // make sure created_at is in REST response

    if (fromDate && d < new Date(fromDate)) return false;
    if (toDate && d > new Date(toDate)) return false;
    return true;
  });

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="wrap">
      <h1>WP Grammar Scanner</h1>

      {error && (
        <div className="notice notice-error">
          <p>{error}</p>
        </div>
      )}

      <p>
        <button
          className="button button-primary"
          onClick={runScan}
          disabled={loadingScan}
        >
          {loadingScan ? "Scanning..." : "Scan Now"}
        </button>
      </p>

      <h2>Scan Reports</h2>

      {/* Filter UI */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ marginRight: "10px" }}>
          From:{" "}
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </label>

        <label style={{ marginRight: "10px" }}>
          To:{" "}
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </label>

        <button
          className="button"
          onClick={() => {
            setFromDate("");
            setToDate("");
          }}
        >
          Clear filters
        </button>
      </div>

      {loadingReports ? (
        <p>Loading reports…</p>
      ) : filteredReports.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        <table className="widefat fixed striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Created At</th>
              <th>Total Posts</th>
              <th>Total Issues</th>
              <th>Download</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.created_at}</td>
                <td>{r.total_posts}</td>
                <td>{r.total_issues}</td>
                <td>
                  {r.csv_url ? (
                    <a
                      href={r.csv_url}
                      className="button button-secondary"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download CSV
                    </a>
                  ) : (
                    <span>No file</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Dashboard;
