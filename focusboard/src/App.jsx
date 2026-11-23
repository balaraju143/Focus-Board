
import  { useEffect, useMemo, useState } from "react";

// Default tasks shown when the application is opened for the first time
const initialTasks = [
  {
    id: 1,
    title: "Complete homepage design",
    description: "Finish the homepage layout and responsive sections.",
    category: "Design",
    status: "In progress",
    priority: "High",
    dueDate: "2026-11-24",
  },
  {
    id: 2,
    title: "Prepare project documentation",
    description: "Write the project overview and development notes.",
    category: "Work",
    status: "To do",
    priority: "Medium",
    dueDate: "2026-11-25",
  },
  {
    id: 3,
    title: "Review React components",
    description: "Check reusable components and clean up the code.",
    category: "Development",
    status: "Completed",
    priority: "High",
    dueDate: "2026-11-20",
  },
  {
    id: 4,
    title: "Team meeting preparation",
    description: "Prepare important points for the team meeting.",
    category: "Meeting",
    status: "To do",
    priority: "Low",
    dueDate: "2026-11-27",
  },
  {
    id: 5,
    title: "Fix mobile responsive issues",
    description: "Test the layout on mobile and tablet screens.",
    category: "Development",
    status: "In progress",
    priority: "High",
    dueDate: "2026-11-23",
  },
  {
    id: 6,
    title: "Update design references",
    description: "Collect and organize the latest design references.",
    category: "Design",
    status: "Completed",
    priority: "Medium",
    dueDate: "2026-11-21",
  },
];

const notes = [
  {
    title: "Stay focused",
    description:
      "Small progress every day leads to big results. Keep moving forward.",
    tag: "DAILY REMINDER",
  },
  {
    title: "Prioritize your work",
    description:
      "Focus on the most important task first. Progress matters more than perfection.",
    tag: "PRODUCTIVITY TIP",
  },
  {
    title: "Take a short break",
    description:
      "Give your mind some rest. A fresh mind helps you work better.",
    tag: "WELLNESS NOTE",
  },
];

const emptyForm = {
  title: "",
  description: "",
  category: "Work",
  status: "To do",
  priority: "Medium",
  dueDate: "",
};

function App() {
  // Load saved tasks without replacing existing data
  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = localStorage.getItem("focusboard-tasks");

      return savedTasks !== null
        ? JSON.parse(savedTasks)
        : initialTasks;
    } catch {
      return initialTasks;
    }
  });

  const [activePage, setActivePage] = useState("Overview");
  const [activeStatus, setActiveStatus] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const [activeNote, setActiveNote] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);

  // Save tasks whenever they change
  useEffect(() => {
    localStorage.setItem("focusboard-tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Dashboard statistics
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In progress"
  ).length;

  const completionPercentage =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  // Search and combined filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        activeStatus === "All" ||
        task.status === activeStatus;

      const matchesPriority =
        priorityFilter === "All" ||
        task.priority === priorityFilter;

      const matchesPage =
        activePage !== "Calendar" ||
        task.dueDate !== "";

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesPage
      );
    });
  }, [tasks, search, activeStatus, priorityFilter, activePage]);

  // Open form for a new task
  const openAddForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setFormError("");
    setShowForm(true);
  };

  // Open form for editing an existing task
  const openEditForm = (task) => {
    setEditingId(task.id);

    setFormData({
      title: task.title,
      description: task.description,
      category: task.category,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
    });

    setFormError("");
    setShowForm(true);
  };

  // Handle form input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Add or update task
  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      setFormError("Please enter a task title.");
      return;
    }

    if (!formData.dueDate) {
      setFormError("Please select a due date.");
      return;
    }

    const cleanTask = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
    };

    if (editingId !== null) {
      setTasks((previous) =>
        previous.map((task) =>
          task.id === editingId
            ? { ...task, ...cleanTask }
            : task
        )
      );
    } else {
      const newTask = {
        id: Date.now(),
        ...cleanTask,
      };

      setTasks((previous) => [newTask, ...previous]);
    }

    setShowForm(false);
    setFormData(emptyForm);
    setFormError("");
    setEditingId(null);
  };

  // Delete task with confirmation
  const deleteTask = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (confirmDelete) {
      setTasks((previous) =>
        previous.filter((task) => task.id !== id)
      );
    }
  };

  // Change task status directly
  const updateStatus = (id, status) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id
          ? { ...task, status }
          : task
      )
    );
  };

  // Navigation
  const changePage = (page) => {
    setActivePage(page);
    setActiveStatus("All");
    setPriorityFilter("All");
    setSearch("");
    setMobileMenu(false);
  };

  const navigation = [
    { name: "Overview", icon: "⌂" },
    { name: "My Tasks", icon: "▤" },
    { name: "Calendar", icon: "▦" },
    { name: "Settings", icon: "⚙" },
  ];

  const visibleNotes = [
    notes[activeNote],
    notes[(activeNote + 1) % notes.length],
    notes[(activeNote + 2) % notes.length],
  ];

  return (
    <div className="app-container">

      {/* MOBILE HEADER */}
      <header className="mobile-header">
        <button
          className="brand"
          onClick={() => changePage("Overview")}
        >
          <span className="brand-icon">F</span>
          <span>FocusBoard</span>
        </button>

        <button
          className="menu-button"
          onClick={() => setMobileMenu(!mobileMenu)}
          aria-label="Toggle navigation"
          aria-expanded={mobileMenu}
        >
          {mobileMenu ? "✕" : "☰"}
        </button>
      </header>

      {/* SIDEBAR */}
      <aside className={`sidebar ${mobileMenu ? "show-sidebar" : ""}`}>

        <button
          className="brand desktop-brand"
          onClick={() => changePage("Overview")}
        >
          <span className="brand-icon">F</span>
          <span>FocusBoard</span>
        </button>

        <p className="sidebar-label">MENU</p>

        <nav className="navigation">
          {navigation.map((item) => (
            <button
              key={item.name}
              className={
                activePage === item.name
                  ? "nav-link active"
                  : "nav-link"
              }
              onClick={() => changePage(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-card">
            <div className="avatar">B</div>
            <div>
              <h4>My Workspace</h4>
              <p>Personal account</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        {/* TOP BAR */}
        <div className="topbar">
          <div>
            <p className="welcome-text">Welcome back!</p>
            <h2>{activePage}</h2>
          </div>

          <button className="top-add-button" onClick={openAddForm}>
            + Add Task
          </button>
        </div>

        {/* OVERVIEW PAGE */}
        {activePage === "Overview" && (
          <>
            <section className="hero-heading">
              <div>
                <p className="small-heading">YOUR PERSONAL WORKSPACE</p>
                <h1>Your work, <span>in focus.</span></h1>
                <p className="hero-description">
                  Organize your tasks, manage your time and
                  accomplish more every day.
                </p>
              </div>
            </section>

            {/* FOCUS NOTES */}
            <section className="focus-section">
              <div className="section-heading">
                <div>
                  <p className="small-heading">A LITTLE MOTIVATION</p>
                  <h2>Focus Notes</h2>
                </div>

                <div className="carousel-controls">
                  <button
                    onClick={() =>
                      setActiveNote(
                        (activeNote - 1 + notes.length) % notes.length
                      )
                    }
                    aria-label="Previous note"
                  >
                    ←
                  </button>

                  <button
                    onClick={() =>
                      setActiveNote(
                        (activeNote + 1) % notes.length
                      )
                    }
                    aria-label="Next note"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="notes-grid">
                {visibleNotes.map((note, index) => (
                  <article
                    className={`note-card note-${index}`}
                    key={note.title}
                  >
                    <span className="note-tag">{note.tag}</span>
                    <h3>{note.title}</h3>
                    <p>{note.description}</p>
                    <span className="note-decoration">✦</span>
                  </article>
                ))}
              </div>

              <div className="note-dots">
                {notes.map((note, index) => (
                  <button
                    key={note.title}
                    aria-label={`Show note ${index + 1}`}
                    className={
                      activeNote === index ? "dot active-dot" : "dot"
                    }
                    onClick={() => setActiveNote(index)}
                  />
                ))}
              </div>
            </section>

            {/* STATISTICS */}
            <section className="stats-section">
              <div className="section-heading">
                <div>
                  <p className="small-heading">YOUR PROGRESS</p>
                  <h2>Task Overview</h2>
                </div>
              </div>

              <div className="stats-grid">
                <article className="stat-card">
                  <div className="stat-top">
                    <span className="stat-icon purple-icon">▤</span>
                    <span className="stat-label">Total Tasks</span>
                  </div>
                  <h2>{totalTasks}</h2>
                  <p>Tasks in your workspace</p>
                </article>

                <article className="stat-card">
                  <div className="stat-top">
                    <span className="stat-icon orange-icon">◷</span>
                    <span className="stat-label">In Progress</span>
                  </div>
                  <h2>{inProgressTasks}</h2>
                  <p>Tasks currently active</p>
                </article>

                <article className="stat-card">
                  <div className="stat-top">
                    <span className="stat-icon green-icon">✓</span>
                    <span className="stat-label">Completed</span>
                  </div>
                  <h2>{completedTasks}</h2>
                  <p>{completionPercentage}% completion rate</p>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </article>
              </div>
            </section>
          </>
        )}

        {/* TASKS / CALENDAR PAGE */}
        {(activePage === "Overview" ||
          activePage === "My Tasks" ||
          activePage === "Calendar") && (
          <section className="tasks-section">

            <div className="section-heading task-heading">
              <div>
                <p className="small-heading">
                  {activePage === "Calendar"
                    ? "YOUR SCHEDULE"
                    : "STAY ORGANIZED"}
                </p>
                <h2>
                  {activePage === "Calendar"
                    ? "Upcoming Tasks"
                    : "Your Tasks"}
                </h2>
              </div>

              <button className="add-task-button" onClick={openAddForm}>
                + Add Task
              </button>
            </div>

            {/* SEARCH AND FILTER */}
            <div className="filter-area">

              <div className="search-box">
                <span>⌕</span>
                <input
                  type="search"
                  placeholder="Search tasks by title..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Search tasks by title"
                />
              </div>

              <select
                className="priority-select"
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(event.target.value)
                }
                aria-label="Filter by priority"
              >
                <option value="All">All Priorities</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

            {/* STATUS TABS */}
            <div className="status-tabs">
              {["All", "To do", "In progress", "Completed"].map(
                (status) => (
                  <button
                    key={status}
                    className={
                      activeStatus === status
                        ? "status-tab selected-tab"
                        : "status-tab"
                    }
                    onClick={() => setActiveStatus(status)}
                  >
                    {status}
                    <span>
                      {status === "All"
                        ? tasks.length
                        : tasks.filter(
                            (task) => task.status === status
                          ).length}
                    </span>
                  </button>
                )
              )}
            </div>

            {/* TASK LIST */}
            <div className="task-list">

              {filteredTasks.length === 0 ? (
                <div className="empty-state">
                  <span>📋</span>
                  <h3>No tasks found</h3>
                  <p>Try changing your search or filters.</p>
                  <button onClick={openAddForm}>
                    Create your first task
                  </button>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <article className="task-card" key={task.id}>

                    <div className="task-main">
                      <div
                        className={
                          task.status === "Completed"
                            ? "task-check checked"
                            : "task-check"
                        }
                      >
                        {task.status === "Completed" ? "✓" : ""}
                      </div>

                      <div className="task-information">
                        <h3>{task.title}</h3>
                        <p>{task.description || "No description"}</p>

                        <div className="task-mobile-details">
                          <span className="category-tag">
                            {task.category}
                          </span>
                          <span className={`priority-tag ${task.priority.toLowerCase()}`}>
                            {task.priority}
                          </span>
                          <span className="task-date">
                            {task.dueDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="task-details">
                      <span className="category-tag">
                        {task.category}
                      </span>

                      <span className={`priority-tag ${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>

                      <span className="task-date">
                        {task.dueDate}
                      </span>
                    </div>

                    <div className="task-actions">
                      <select
                        value={task.status}
                        onChange={(event) =>
                          updateStatus(task.id, event.target.value)
                        }
                        aria-label={`Change status of ${task.title}`}
                        className="task-status-select"
                      >
                        <option value="To do">To do</option>
                        <option value="In progress">In progress</option>
                        <option value="Completed">Completed</option>
                      </select>

                      <button
                        className="action-button edit-button"
                        onClick={() => openEditForm(task)}
                        aria-label={`Edit ${task.title}`}
                        title="Edit task"
                      >
                        ✎
                      </button>

                      <button
                        className="action-button delete-button"
                        onClick={() => deleteTask(task.id)}
                        aria-label={`Delete ${task.title}`}
                        title="Delete task"
                      >
                        ×
                      </button>
                    </div>

                  </article>
                ))
              )}

            </div>
          </section>
        )}

        {/* SETTINGS PAGE */}
        {activePage === "Settings" && (
          <section className="settings-section">
            <p className="small-heading">PREFERENCES</p>
            <h2>Settings</h2>

            <div className="settings-card">
              <h3>Workspace information</h3>
              <p>FocusBoard - Personal Task Management</p>
              <p>Total saved tasks: {totalTasks}</p>
              <p>Storage: Browser LocalStorage</p>
            </div>

            <div className="settings-card">
              <h3>Task data</h3>
              <p>
                Your tasks are automatically saved in this browser.
              </p>

              <button
                className="danger-outline"
                onClick={() => {
                  const confirmed = window.confirm(
                    "Delete all tasks? This action cannot be undone."
                  );

                  if (confirmed) {
                    setTasks([]);
                  }
                }}
              >
                Clear all tasks
              </button>
            </div>
          </section>
        )}

        <footer className="footer">
          <p>© 2026 FocusBoard. Stay focused. Get things done.</p>
        </footer>
      </main>

      {/* ADD / EDIT TASK MODAL */}
      {showForm && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <div
            className="task-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-form-title"
          >
            <div className="modal-heading">
              <div>
                <p className="small-heading">TASK MANAGEMENT</p>
                <h2 id="task-form-title">
                  {editingId !== null ? "Edit Task" : "Create New Task"}
                </h2>
              </div>

              <button
                className="close-modal"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label htmlFor="title">Task Title *</label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  placeholder="Enter task title"
                  value={formData.title}
                  onChange={handleChange}
                  maxLength={100}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Write task description..."
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="form-row">

                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option>Work</option>
                    <option>Design</option>
                    <option>Development</option>
                    <option>Meeting</option>
                    <option>Personal</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>

              </div>

              <div className="form-row">

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option>To do</option>
                    <option>In progress</option>
                    <option>Completed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="dueDate">Due Date *</label>
                  <input
                    id="dueDate"
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

              {formError && (
                <p className="form-error" role="alert">
                  {formError}
                </p>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="submit-button">
                  {editingId !== null ? "Save Changes" : "Create Task"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {navigation.slice(0, 3).map((item) => (
          <button
            key={item.name}
            className={activePage === item.name ? "bottom-active" : ""}
            onClick={() => changePage(item.name)}
          >
            <span>{item.icon}</span>
            {item.name}
          </button>
        ))}

        <button onClick={openAddForm}>
          <span>＋</span>
          Add Task
        </button>
      </nav>

    </div>
  );
}

export default App;
