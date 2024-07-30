import React, { useState, useEffect } from 'react';
import NavBar from '../components/Navbar';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

function CalendarPage() {
    const [events, setEvents] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        console.log('Current date:', currentDate);
        fetchProjects(currentDate);
    }, [currentDate]);

    function fetchProjects(date) {
        const startOfMonth = moment(date).startOf('month').toDate();
        const endOfMonth = moment(date).endOf('month').toDate();
        const startDateISO = startOfMonth.toISOString();
        const endDateISO = endOfMonth.toISOString();
        console.log('Request URL:', `/projects?start=${startDateISO}&end=${endDateISO}`);

        fetch(`/projects?start=${startDateISO}&end=${endDateISO}`)
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch projects');
                return response.json();
            })
            .then(data => {
                console.log('Fetched data:', data);

                const formattedEvents = data.map(project => ({
                    id: project.id,
                    title: project.name,
                    start: moment(project.due_date).add(1, 'days').toDate(),
                    end: moment(project.due_date).add(1, 'days').toDate(),
                }));
                console.log('Formatted events:', formattedEvents);

                setEvents(formattedEvents);
            })
            .catch(error => {
                console.error('Error fetching projects:', error);
            });
    }

    function handleNextMonth() {
        const newDate = moment(currentDate).add(1, 'month').toDate();
        console.log('Navigating to next month:', newDate);
        setCurrentDate(newDate);
    }

    function handlePrevMonth() {
        const newDate = moment(currentDate).subtract(1, 'month').toDate();
        console.log('Navigating to previous month:', newDate);
        setCurrentDate(newDate);
    }

    function handleNavigate(date) {
        console.log('Navigating to date:', date);
        setCurrentDate(date);
    }

    // Custom Toolbar
    const CustomToolbar = (toolbar) => {
        console.log('Toolbar props:', toolbar);
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                <button onClick={handlePrevMonth}>Previous Month</button>
                <h2 style={{ margin: '0 20px' }}>{moment(currentDate).format('MMMM YYYY')}</h2>
                <button onClick={handleNextMonth}>Next Month</button>
            </div>
        );
    };

    return (
        <div>
            <NavBar />
            <div style={{ height: 500 }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    views={['month']}
                    style={{ margin: '50px' }}
                    date={currentDate} // Use `date` prop to control the calendar view
                    onNavigate={handleNavigate}
                    components={{
                        toolbar: CustomToolbar,
                    }}
                />
            </div>
        </div>
    );
}

export default CalendarPage;