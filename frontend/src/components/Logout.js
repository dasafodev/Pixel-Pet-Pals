import React from 'react';
import { useHistory } from 'react-router-dom';

function Logout({ onLogout }) {
  const history = useHistory();

  const handleConfirmLogout = () => {
    // onLogout will handle the actual logout logic and redirection
    onLogout(); 
  };

  const handleCancelLogout = () => {
    history.push('/home');
  };

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '20px',
      textAlign: 'center',
    }}>
      <img 
        src={process.env.PUBLIC_URL + '/pets/pet_3.png'} 
        alt="Goodbye pet" 
        style={{ width: '100px', height: '100px', marginBottom: '20px', borderRadius: '50%' }} 
      />
      <h2>Logging you out...<br />Hope to see you again soon!</h2>
      
      {/* Spinner - consider if this should only show after clicking "Yes" */}
      {/* For now, it's always visible as per "Logging you out..." message */}
      <div style={{
        marginTop: '20px',
        marginBottom: '30px', // Added margin below spinner
        width: '50px',
        height: '50px',
        border: '5px solid #8ecae6', 
        borderRadius: '50%',
        borderTopColor: 'transparent',
        animation: 'spin 1s linear infinite'
      }}></div>

      {/* Confirmation Buttons directly on the page */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', width: '100%' }}>
        <button 
          onClick={handleConfirmLogout} 
          style={{ 
            padding: '12px 25px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontSize: '1em',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'background-color 0.2s ease',
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
        >
          Yes, Log Out
        </button>
        <button 
          onClick={handleCancelLogout} 
          style={{ 
            padding: '12px 25px', 
            backgroundColor: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontSize: '1em',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'background-color 0.2s ease',
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
        >
          Cancel
        </button>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default Logout;
