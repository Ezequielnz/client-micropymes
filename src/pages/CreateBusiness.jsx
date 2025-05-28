import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { businessAPI } from '../utils/api';

function CreateBusiness() {
    const [businessName, setBusinessName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await businessAPI.createBusiness({ nombre: businessName });
            navigate('/'); // Redirecting to home for now, adjust as needed
        } catch (err) {
            console.error('Error creating business:', err);
            const errorMessage = err.response?.data?.detail || err.message || 'Error creating business';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h1>Create New Business</h1>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="businessName">Business Name</label>
                    <input
                        type="text"
                        id="businessName"
                        name="businessName"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Business'}
                </button>
            </form>
        </div>
    );
}

export default CreateBusiness; 