import { useEffect, useState, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';

import { retrieveTickets, deleteTicket } from '../api/ticketAPI';
import ErrorPage from './ErrorPage';
import Swimlane from '../components/Swimlane';
import { TicketData } from '../interfaces/TicketData';
import { ApiMessage } from '../interfaces/ApiMessage';

import auth from '../utils/auth';

const boardStates = ['Todo', 'In Progress', 'Done'];

const Board = () => {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [error, setError] = useState(false);
  const [loginCheck, setLoginCheck] = useState(false);

  const checkLogin = () => {
    if (auth.loggedIn()) {
      setLoginCheck(true);
    }
  };

  const fetchTickets = async () => {
    try {
      const data = await retrieveTickets();
      setTickets(data);
    } catch (err) {
      console.error('Failed to retrieve tickets:', err);
      setError(true);
    }
  };

  const deleteIndvTicket = async (ticketId: number): Promise<ApiMessage> => {
    try {
      const data = await deleteTicket(ticketId);
      fetchTickets();
      return data;
    } catch (err) {
      return Promise.reject(err);
    }
  };

  useLayoutEffect(() => {
    checkLogin();
  }, []);

  useEffect(() => {
    document.body.classList.add('board-background');
    return () => {
      document.body.classList.remove('board-background');
    };
  }, []);

  useEffect(() => {
    if (loginCheck) {
      fetchTickets();
    }
  }, [loginCheck]);

  if (error) {
    return <ErrorPage />;
  }

  return (
    <>
      {!loginCheck ? (
        <div className='login-notice'>
          <h1>Login To Create & View Tickets</h1>
        </div>
      ) : (
        <div className='board'>
          <div className='new-ticket-wrapper'>
            <button type='button' className='newTicketBtn'>
              <Link to='/create'>New Ticket</Link>
            </button>

            {/* Jump to section menu - mobile only */}
            <select
              className='jump-menu'
              onChange={(e) => {
                const sectionId = e.target.value;
                const section = document.getElementById(sectionId);
                if (section) {
                  section.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <option value="">Jump to Section</option>
              <option value="todo">Todo</option>
              <option value="inprogress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className='board-display'>
            {boardStates.map((status) => {
              const filteredTickets = tickets.filter(ticket => ticket.status === status);
              return (
                <div id={status.replace(/\s+/g, '').toLowerCase()} key={status}>
                  <Swimlane
                    title={status}
                    tickets={filteredTickets}
                    deleteTicket={deleteIndvTicket}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default Board;
