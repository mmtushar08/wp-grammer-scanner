import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '../components/Loader';

const Settings = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/wp-json/wp-grammar-scanner/v1/settings', {
                withCredentials: true
            });
            setSettings(res.data || {}); // no .settings key
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            await axios.post('/wp-json/wp-grammar-scanner/v1/settings',
                { settings },
                { withCredentials: true }
            );
            alert('Settings saved successfully');
        } catch (err) {
            console.error(err);
            alert('Error saving settings');
        }
        setSaving(false);
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleChange = e => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="wpgs-settings">
            <h2>Plugin Settings</h2>
            {loading ? (
                <Loader />
            ) : (
                <form onSubmit={e => { e.preventDefault(); saveSettings(); }}>
                    <div className="wpgs-form-group">
                        <label>Email to receive report:</label>
                        <input type="email" name="email_report" value={settings.email_report || ''} onChange={handleChange} />
                    </div>
                    <div className="wpgs-form-group">
                        <label>Scan Frequency:</label>
                        <select name="scan_frequency" value={settings.scan_frequency || 'monthly'} onChange={handleChange}>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>
                    <div className="wpgs-form-group">
                        <label>Language:</label>
                        <input type="text" name="language" value={settings.language || 'en-US'} onChange={handleChange} />
                    </div>
                    <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</button>
                </form>
            )}
        </div>
    );
};


export default Settings;
