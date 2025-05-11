import React from 'react';
import { NavLink } from 'react-router-dom';

// Accept totalUnreadCount as a prop
function Sidebar({ totalUnreadCount }) { 
  return (
    <div className="sidebar">

      <NavLink to="/home" className="sidebar-btn" activeClassName="active" title="Home">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path d="M20 2h2v20H2v-8h2v6h4v-4h2v4h4v-6h2v6h4V4H10v2H8V2h12zm-8 10h2v2h-2v-2zm-2-2h2v2h-2v-2zm-2 0V8h2v2H8zm-2 2v-2h2v2H6zm0 0H4v2h2v-2zm10-6h2v2h-2V6zm-2 0h-2v2h2V6zm2 4h2v2h-2v-2z" fill="currentColor"/>
        </svg>
      </NavLink> 
      
      <NavLink to="/chat" className="sidebar-btn" activeClassName="active" title="Chat">
        <div style={{ position: 'relative' }}>
          <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path d="M5 3h14v2H5V3zm0 16H3V5h2v14zm14 0v2H5v-2h14zm0 0h2V5h-2v14zM10 8H8v2h2V8zm4 0h2v2h-2V8zm-5 6v-2H7v2h2zm6 0v2H9v-2h6zm0 0h2v-2h-2v2z" fill="currentColor"/>
          </svg>
        </div>
      </NavLink>     
      
      <NavLink exact to="/friends" className="sidebar-btn" activeClassName="active" title="Friends">
        <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path d="M11 0H5v2H3v6h2v2h6V8H5V2h6V0zm0 2h2v6h-2V2zM0 14h2v4h12v2H0v-6zm2 0h12v-2H2v2zm14 0h-2v6h2v-6zM15 0h4v2h-4V0zm4 8h-4v2h4V8zm0-6h2v6h-2V2zm5 12h-2v4h-4v2h6v-6zm-6-2h4v2h-4v-2z" fill="currentColor"/>
        </svg>
        {/* Add notification badge */}
        {totalUnreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '0px',
            right: '1px',
            backgroundColor: 'red',
            color: 'white',
            borderRadius: '50%',
            padding: '1px 4px',
            fontSize: '12px',
            fontWeight: 'bold',
            fontFamily: 'sans-serif', // Use a standard font for the badge
            minWidth: '10px',
            textAlign: 'center'
          }}>
            {totalUnreadCount}
          </span>
        )}
      </NavLink>

      <NavLink to="/community" className="sidebar-btn" activeClassName="active" title="Community">
        <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path d="M15 2h2v2h4v18H3V4h4V2h2v2h6V2zm4 6V6H5v2h14zm0 2H5v10h14V10zm-3 2v2h-2v-2h2zm-4 4v-2h2v2h-2zm-2 0h2v2h-2v-2zm0 0H8v-2h2v2z" fill="currentColor"/>
        </svg>
      </NavLink>
     
      <NavLink to="/logout" className="sidebar-btn" activeClassName="active" title="Logout">
        <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path d="M5 3h16v4h-2V5H5v14h14v-2h2v4H3V3h2zm16 8h-2V9h-2V7h-2v2h2v2H7v2h10v2h-2v2h2v-2h2v-2h2v-2z" fill="currentColor"/>
        </svg>
      </NavLink>
    </div>
  );
}

export default Sidebar;
