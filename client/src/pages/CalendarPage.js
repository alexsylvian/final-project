import React, { useState, useEffect } from 'react';
import NavBar from '../components/Navbar';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

function CalendarPage() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetchProjects();
    }, []);

    function fetchProjects() {
        fetch('/projects')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch projects');
                }
                return response.json();
            })
            .then(data => {
                const formattedEvents = data.map(project => ({
                    id: project.id,
                    title: project.name,
                    start: moment(project.due_date).add(1, 'days').toDate(),
                    end: moment(project.due_date).add(1, 'days').toDate(),
                }));
                setEvents(formattedEvents);
            })
            .catch(error => {
                console.error('Error fetching projects:', error);
            });
    }

    return (
        <div>
            <NavBar />
            <div style={{ height: 500 }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    views={['month', 'week', 'day']}
                    style={{ margin: '50px' }}
                />
            </div>
        </div>
    );
}

export default CalendarPage;