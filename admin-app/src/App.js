import React, { useEffect, useState } from "react";
import { api } from "./services/api";

export default function App() {
    const [loading, setLoading] = useState(false);
    const [reports, setReports] = useState([]);
    const [settings, setSettings] = useState({
        auto_scan: true,
        scan_interval_days: 30,
    });
    const [message, setMessage] = useState("");

    const loadData = async () => {
        try {
            const [r, s] = await Promise.all([
                api.getReports(),
                api.getSettings(),
            ]);
            setReports(r);
            setSettings(s);
        } catch (e) {
            console.error(e);
            setMessage("Error loading data.");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleScan = async () => {
        setLoading(true);
        setMessage("");
        try {
            const res = await api.scanNow();
            setMessage(`Scan done. Issues found: ${res.issues.length}`);
            await loadData();
        } catch (e) {
            console.error(e);
            setMessage("Scan failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        try {
            const res = await api.saveSettings(settings);
            setSettings(res.settings);
            setMessage("Settings saved.");
        } catch (e) {
            console.error(e);
            setMessage("Failed to save settings.");
        }
    };

    return (
        <div>
            <button
                className="button button-primary"
                onClick={handleScan}
                disabled={loading}
            >
                {loading ? "Scanning..." : "Scan Now"}
            </button>

            {message && <p style={{ marginTop: "10px" }}>{message}</p>}

            <hr />

            <h2>Schedule</h2>
            <form onSubmit={handleSaveSettings}>
                <label>
                    <input
                        type="checkbox"
                        checked={!!settings.auto_scan}
                        onChange={(e) =>
                            setSettings({ ...settings, auto_scan: e.target.checked })
                        }
                    />{" "}
                    Enable automatic scan
                </label>
                <br />
                <label>
                    Interval (days):{" "}
                    <input
                        type="number"
                        min="1"
                        value={settings.scan_interval_days}
                        onChange={(e) =>
                            setSettings({
                                ...settings,
                                scan_interval_days: parseInt(e.target.value || "1", 10),
                            })
                        }
                    />
                </label>
                <br />
                <button className="button button-secondary" type="submit">
                    Save Settings
                </button>
            </form>

            <hr />

            <h2>Reports</h2>
            {reports.length === 0 && <p>No reports found.</p>}
            {reports.length > 0 && (
                <table className="widefat striped">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Total Posts</th>
                            <th>Total Issues</th>
                            <th>Download</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map((r) => (
                            <tr key={r.id}>
                                <td>{r.created_at}</td>
                                <td>{r.status}</td>
                                <td>{r.total_posts}</td>
                                <td>{r.total_issues}</td>
                                <td>
                                    {r.csv_url ? (
                                        <a href={r.csv_url} target="_blank" rel="noreferrer">
                                            Download CSV
                                        </a>
                                    ) : (
                                        "-"
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
