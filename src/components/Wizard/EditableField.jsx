import React, { useState, useEffect } from 'react';
import { Pencil, Check } from 'lucide-react';

const EditableField = ({ label, value, onSave }) => {
    const [editing, setEditing] = useState(false);
    const [localVal, setLocalVal] = useState(value);

    const isMissing = !value || value === 'N/A' || value === 'Ver PDF para nombre' || value === '—' || String(value).trim() === '';

    useEffect(() => {
        setLocalVal(value);
    }, [value]);

    const handleSave = () => {
        if (localVal && localVal.trim()) {
            onSave(localVal.trim());
        }
        setEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') {
            setLocalVal(value);
            setEditing(false);
        }
    };

    return (
        <div className="data-item editable-field">
            <label>{label}</label>
            {editing ? (
                <div className="edit-row">
                    <input
                        className="edit-input"
                        value={localVal}
                        autoFocus
                        onChange={(e) => setLocalVal(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button className="edit-save-btn" onClick={handleSave} title="Guardar">
                        <Check size={14} />
                    </button>
                </div>
            ) : (
                <div className="display-row">
                    <p className={isMissing ? 'value-missing' : ''}>{value || '—'}</p>
                    <button className="edit-btn" onClick={() => setEditing(true)} title="Editar">
                        <Pencil size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default EditableField;
