
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FormState, CalculationResult, SavedProject } from './types';
import { useCalculation } from './hooks/useCalculation';
import { useTheme } from './hooks/useTheme';
import { saveStateToFile, exportToTxt, printOffer, exportWorkspaceToFile, WorkspaceExport } from './services/fileService';
import Header from './components/Header';
import MainContent from './components/MainContent';
import Sidebar from './components/Sidebar';
import Results from './components/Results';
import PriceTableModal from './components/PriceTableModal';
import ConfirmModal from './components/ConfirmModal';
import { INITIAL_FORM_STATE } from './constants';

const WORKSPACE_STORAGE_KEY = 'sk_workspace_data';
const WORKSPACE_NAME_KEY = 'sk_workspace_name';

// Helper to ensure imported projects have valid structure and Types
const sanitizeProject = (p: any): SavedProject => {
  const fallbackId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  
  // Force ID to be string to avoid mismatch issues (number vs string) in filters
  const rawId = p.id || (p.data && p.data.id);
  const finalId = rawId ? String(rawId) : fallbackId;

  // Case 1: It's a SavedProject structure (has 'data' property)
  if (p && typeof p === 'object' && 'data' in p) {
      return {
          id: finalId,
          name: p.name || p.data.objectName || 'Без име',
          lastModified: Number(p.lastModified) || Date.now(),
          data: p.data,
          isArchived: !!p.isArchived
      };
  }
  
  // Case 2: It's likely a raw FormState (no 'data' wrapper)
  return {
      id: finalId,
      name: p.objectName || 'Импортиран проект',
      lastModified: Date.now(),
      data: p, // Assume p itself is the FormState
      isArchived: false
  };
};

export default function App() {
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  
  // Workspace State
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [workspaceName, setWorkspaceName] = useState<string>('');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // UI State
  const [isPriceTableOpen, setIsPriceTableOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });

  const calculationResult: CalculationResult = useCalculation(formState);

  // Initialize Workspace
  useEffect(() => {
    const savedWorkspace = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    const savedWorkspaceName = localStorage.getItem(WORKSPACE_NAME_KEY);
    
    if (savedWorkspaceName) {
        setWorkspaceName(savedWorkspaceName);
    }

    if (savedWorkspace) {
      try {
        const loadedProjects = JSON.parse(savedWorkspace);
        if (Array.isArray(loadedProjects)) {
            setSavedProjects(loadedProjects.map(sanitizeProject));
        }
      } catch (error) {
        console.error("Failed to parse workspace", error);
      }
    }
  }, []);

  // Persist Workspace whenever projects change
  useEffect(() => {
    localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(savedProjects));
  }, [savedProjects]);

  // Persist Workspace Name
  useEffect(() => {
      localStorage.setItem(WORKSPACE_NAME_KEY, workspaceName);
  }, [workspaceName]);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const openConfirm = (message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleInputChange = useCallback((id: keyof FormState, value: string | number | boolean) => {
    setFormState(prevState => {
      const newState = { ...prevState, [id]: value };
      
      // Reset dependent fields when their controller changes
      if (id === 'projectType') {
        newState.area = 0;
        newState.wallSections = 1;
        newState.additionalLength = 0;
      }
      if (id === 'hasComplexity' && !value) {
        newState.complexityPercentage = 0;
      }

      return newState;
    });
  }, []);
  
  // --- Workspace Actions ---

  const handleSaveToWorkspace = useCallback((asNew: boolean = false) => {
    const now = Date.now();
    const dateStr = new Date(now).toLocaleString('bg-BG', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
    
    // Determine name
    const nameFromInput = (formState.objectName || '').trim();
    const defaultName = `Проект ${dateStr}`;
    const finalName = nameFromInput || defaultName;

    // Update form state visually if it was empty
    if (!nameFromInput) {
        setFormState(prev => ({...prev, objectName: finalName}));
    }
    
    if (currentProjectId && !asNew) {
      // UPDATE existing project
      setSavedProjects(prev => prev.map(p => {
        if (p.id === currentProjectId) {
          return {
            ...p,
            name: finalName,
            lastModified: now,
            data: { ...formState, objectName: finalName }
          };
        }
        return p;
      }));
      
      showNotification("Промените са запазени.");
    } else {
      // CREATE new project
      const newId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newProject: SavedProject = {
        id: newId,
        name: finalName,
        lastModified: now,
        data: { ...formState, objectName: finalName },
        isArchived: false
      };
      setSavedProjects(prev => [newProject, ...prev]);
      setCurrentProjectId(newId);
      showNotification("Проектът е добавен в работното пространство.");
    }
  }, [currentProjectId, formState]);

  const handleLoadProject = useCallback((id: string) => {
    const project = savedProjects.find(p => String(p.id) === String(id));
    if (project) {
      setFormState(project.data);
      setCurrentProjectId(project.id);
      // Mobile: close sidebar on load for better UX
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
      showNotification(`Зареден: ${project.name}`);
    }
  }, [savedProjects]);

  const handleDeleteProject = useCallback((id: string) => {
    const targetId = String(id);
    openConfirm("Сигурни ли сте, че искате да изтриете този проект?", () => {
        setSavedProjects(prev => prev.filter(p => String(p.id) !== targetId));

        // If we are deleting the currently active project, clear the form
        // Use functional update logic or check currentProjectId from outer scope (it's in deps)
        if (currentProjectId && String(currentProjectId) === targetId) {
            setCurrentProjectId(null);
            setFormState(INITIAL_FORM_STATE);
        }
        showNotification("Проектът е изтрит.");
    });
  }, [currentProjectId]);

  const handleArchiveProject = useCallback((id: string) => {
      const targetId = String(id);
      setSavedProjects(prev => prev.map(p => String(p.id) === targetId ? { ...p, isArchived: true } : p));
      showNotification("Проектът е архивиран.");
      
      if (currentProjectId && String(currentProjectId) === targetId) {
          setCurrentProjectId(null);
          setFormState(INITIAL_FORM_STATE);
      }
  }, [currentProjectId]);

  const handleUnarchiveProject = useCallback((id: string) => {
      const targetId = String(id);
      setSavedProjects(prev => prev.map(p => String(p.id) === targetId ? { ...p, isArchived: false } : p));
      showNotification("Проектът е възстановен.");
  }, []);

  const handleReorderProjects = useCallback((newOrder: SavedProject[]) => {
      setSavedProjects(newOrder);
  }, []);

  const handleClearWorkspace = useCallback(() => {
      if (savedProjects.length === 0) {
          showNotification("Списъкът вече е празен.");
          return;
      }
      
      openConfirm("ВНИМАНИЕ: Това ще изтрие ВСИЧКИ проекти от текущия списък. Сигурни ли сте?", () => {
          setSavedProjects([]);
          setCurrentProjectId(null);
          setFormState(INITIAL_FORM_STATE);
          setWorkspaceName('');
          showNotification("Работното пространство е изчистено.");
      });
  }, [savedProjects]); 

  const handleExportWorkspace = useCallback(() => {
      if (savedProjects.length === 0) {
          alert("Няма проекти за експортиране.");
          return;
      }
      exportWorkspaceToFile(workspaceName, savedProjects);
      showNotification("Работното пространство е експортирано.");
  }, [savedProjects, workspaceName]);

  const handleImportWorkspace = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const rawContent = e.target?.result as string;
              const parsed = JSON.parse(rawContent);
              
              let newProjects: SavedProject[] = [];
              let newName = '';

              if (Array.isArray(parsed)) {
                  newProjects = parsed.map(sanitizeProject);
                  newName = 'Импортирано работно място';
              } else if (parsed && typeof parsed === 'object') {
                   if (parsed.projects && Array.isArray(parsed.projects)) {
                       newProjects = parsed.projects.map((p: any) => sanitizeProject(p));
                       newName = parsed.name || 'Без име';
                   } else {
                       throw new Error("Невалиден формат на файла.");
                   }
              } else {
                   throw new Error("Непознат формат.");
              }

              if (newProjects.length === 0) {
                   alert("Файлът не съдържа валидни проекти.");
                   return;
              }

              openConfirm(`Ще заредите работно пространство "${newName}" с ${newProjects.length} проекта. Това ще замени текущия списък. Продължи?`, () => {
                  setWorkspaceName(newName);
                  setSavedProjects(newProjects);
                  setCurrentProjectId(null);
                  setFormState(INITIAL_FORM_STATE);
                  showNotification("Работното пространство е заредено успешно.");
              });

          } catch (err) {
              alert('Грешка при четене на файла! Уверете се, че избирате валиден JSON файл.');
              console.error(err);
          }
      };
      reader.readAsText(file);
      event.target.value = ''; // Reset input
  }, []);

  const handleNewProject = useCallback(() => {
    setFormState(INITIAL_FORM_STATE);
    setCurrentProjectId(null);
    showNotification("Формата е изчистена за нов проект.");
  }, []);

  const handleClearCurrentForm = useCallback(() => {
      openConfirm("Сигурни ли сте, че искате да изчистите данните във формата?", () => {
          setFormState(prev => ({
              ...INITIAL_FORM_STATE,
              objectName: prev.objectName 
          }));
          showNotification("Данните са изчистени.");
      });
  }, []);

  const handleImportMultipleProjects = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const projectsToAdd: SavedProject[] = [];
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            
            if (Array.isArray(parsed)) {
                 parsed.forEach(p => projectsToAdd.push(sanitizeProject(p)));
            } 
            else if (parsed.projects && Array.isArray(parsed.projects)) {
                 parsed.projects.forEach((p: any) => projectsToAdd.push(sanitizeProject(p)));
            }
            else {
                 projectsToAdd.push(sanitizeProject(parsed));
            }

        } catch (e) {
            console.error(`Failed to load file ${file.name}`, e);
            alert(`Грешка при зареждане на файл: ${file.name}`);
        }
    }

    if (projectsToAdd.length > 0) {
        setSavedProjects(prev => [...projectsToAdd, ...prev]);
        showNotification(`Успешно добавени ${projectsToAdd.length} проекта.`);
    } else {
        showNotification("Няма валидни проекти за импортиране.");
    }

    event.target.value = '';
  }, []);


  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const memoizedMainContent = useMemo(() => (
    <MainContent formState={formState} onInputChange={handleInputChange} />
  ), [formState, handleInputChange]);

  const memoizedSidebar = useMemo(() => (
    <Sidebar
      formState={formState}
      savedProjects={savedProjects}
      workspaceName={workspaceName}
      setWorkspaceName={setWorkspaceName}
      currentProjectId={currentProjectId}
      notification={notification}
      onInputChange={handleInputChange}
      onNewProject={handleNewProject}
      onSaveToWorkspace={handleSaveToWorkspace}
      onLoadProject={handleLoadProject}
      onDeleteProject={handleDeleteProject}
      onArchiveProject={handleArchiveProject}
      onUnarchiveProject={handleUnarchiveProject}
      onReorderProjects={handleReorderProjects}
      onClearWorkspace={handleClearWorkspace}
      onExportWorkspace={handleExportWorkspace}
      onImportWorkspace={handleImportWorkspace}
      onClearCurrentForm={handleClearCurrentForm}
      onExportFile={() => saveStateToFile(formState)}
      onFileLoad={handleImportMultipleProjects} 
      onOpenPriceTable={() => setIsPriceTableOpen(true)}
    />
  ), [formState, savedProjects, workspaceName, currentProjectId, notification, handleInputChange, handleNewProject, handleSaveToWorkspace, handleLoadProject, handleDeleteProject, handleArchiveProject, handleUnarchiveProject, handleReorderProjects, handleClearWorkspace, handleExportWorkspace, handleImportWorkspace, handleClearCurrentForm, handleImportMultipleProjects]);

  const memoizedResults = useMemo(() => (
     <Results
      result={calculationResult}
      formState={formState}
      onPrint={() => printOffer(formState, calculationResult)}
      onExport={() => exportToTxt(calculationResult.log, calculationResult.currentTotal, formState.objectName, formState.currencyDisplay)}
    />
  ), [calculationResult, formState]);

  return (
    <div className="min-h-screen bg-bunker-50 dark:bg-bunker-950 text-bunker-800 dark:text-bunker-200 font-sans transition-colors duration-300">
      <Header theme={theme} toggleTheme={toggleTheme} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`${isSidebarOpen ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-8`}>
            {memoizedMainContent}
            {memoizedResults}
          </div>
          {isSidebarOpen && (
            <div className="lg:col-span-1">
              {memoizedSidebar}
            </div>
          )}
        </div>
      </main>

      <footer className="text-center py-6 text-sm text-bunker-500 dark:text-bunker-400">
        <p>© {new Date().getFullYear()} Калкулатор СК. Всички права запазени.</p>
      </footer>

      <PriceTableModal isOpen={isPriceTableOpen} onClose={() => setIsPriceTableOpen(false)} />
      
      <ConfirmModal 
        isOpen={confirmModal.isOpen} 
        message={confirmModal.message} 
        onConfirm={confirmModal.onConfirm} 
        onClose={closeConfirm}
      />
    </div>
  );
}
