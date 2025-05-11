import React, { useState } from 'react';
import { login, register } from '../api'; // Import API functions

function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [petName, setPetName] = useState('');
  const [petAvatar, setPetAvatar] = useState('/avatars/avatar_1.png'); // Default avatar
  const [error, setError] = useState(''); // For displaying API errors

  const avatarOptions = [
    '/avatars/avatar_1.png',
    '/avatars/avatar_2.png',
    '/avatars/avatar_3.png',
    '/avatars/avatar_4.png',
    '/avatars/avatar_5.png',
    '/avatars/avatar_6.png',
    '/avatars/avatar_7.png',
    '/avatars/avatar_8.png'
  ];

  // This map might be less relevant if petImage is handled by backend or derived differently
  // const avatarToPetMap = {
  //   '/avatars/avatar_1.png': '/pets/cat_1.png',
  //   // ... other mappings
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      if (isLogin) {
        const response = await login({ username, password });
        if (response.success && response.token && response.user) {
          onLogin(response.user, response.token); // Pass user and token to App.js
        } else {
          setError(response.message || 'Login failed. Please check your credentials.');
        }
      } else {
        // For registration, ensure all required fields are passed
        const response = await register({
          username,
          email,
          password,
          petName,
          petAvatar // Backend expects petAvatar
        });
        if (response.success && response.token && response.user) {
          onLogin(response.user, response.token); // Pass user and token to App.js
        } else {
          setError(response.error || response.message || 'Registration failed. Please try again.');
        }
      }
    } catch (err) {
      // err here is likely the object thrown by api/index.js, which is error.response.data
      setError(err.error || err.message || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#faebd7',
      padding: '20px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%'
    }}>
      <div style={{
        backgroundColor: '#fefae0',
        border: '4px solid #000',
        boxShadow: '8px 8px 0 #000',
        padding: '30px',
        width: '100%',
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <h1 style={{ marginBottom: '20px' }}>Pet Social</h1>
        
        {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => setIsLogin(true)}
            style={{
              backgroundColor: isLogin ? '#8ecae6' : '#fefae0',
              fontFamily: "'Press Start 2P'",
              fontSize: '14px',
              padding: '10px 20px',
              border: '3px solid #000',
              cursor: 'pointer',
              boxShadow: isLogin ? '2px 2px 0px #000' : 'none',
              transition: 'all 0.2s ease',
              marginRight: '10px'
            }}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            style={{
              backgroundColor: !isLogin ? '#8ecae6' : '#fefae0',
              fontFamily: "'Press Start 2P'",
              fontSize: '14px',
              padding: '10px 20px',
              border: '3px solid #000',
              cursor: 'pointer',
              boxShadow: !isLogin ? '2px 2px 0px #000' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              Username:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '3px solid #000',
                fontFamily: "'Press Start 2P'",
                fontSize: '12px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '3px solid #000',
                fontFamily: "'Press Start 2P'",
                fontSize: '12px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {!isLogin && (
            <>
              <div style={{ marginBottom: '15px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  Email:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '3px solid #000',
                    fontFamily: "'Press Start 2P'",
                    fontSize: '12px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  Pet Name:
                </label>
                <input
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '3px solid #000',
                    fontFamily: "'Press Start 2P'",
                    fontSize: '12px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  Choose an Avatar:
                </label>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  marginBottom: '15px'
                }}>
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => setPetAvatar(avatar)}
                      style={{
                        width: '48px',
                        height: '48px',
                        padding: 0,
                        backgroundColor: petAvatar === avatar ? '#d0ebff' : '#fff',
                        border: '2px solid #000',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        overflow: 'hidden'
                      }}
                    >
                      <img
                        src={avatar}
                        alt="avatar"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: '#8ecae6',
              fontFamily: "'Press Start 2P'",
              fontSize: '14px',
              padding: '12px',
              border: '3px solid #000',
              cursor: 'pointer',
              boxShadow: '2px 2px 0px #000',
              transition: 'all 0.2s ease',
              marginTop: '10px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#6db5d9';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#8ecae6';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div style={{ marginTop: '20px', fontSize: '12px' }}>
          <p>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={() => setIsLogin(!isLogin)}
              style={{
                background: 'none',
                border: 'none',
                color: '#0066cc',
                cursor: 'pointer',
                fontFamily: "'Press Start 2P'",
                fontSize: '12px',
                textDecoration: 'underline',
                marginLeft: '8px'
              }}
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
