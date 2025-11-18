
import React, { useRef, useState } from 'react';
import Card, { CardHeader, CardContent } from './common/Card';
import Input from './common/Input';
import Select from './common/Select';
import Checkbox from './common/Checkbox';
import Button from './common/Button';
import { FormState, SavedProject } from '../types';
import { constructionTypes } from '../constants';
import { SaveIcon, FolderOpenIcon, TrashIcon, TableIcon, DownloadIcon, XIcon, ArchiveIcon, UnarchiveIcon, DragHandleIcon } from './icons';


interface SidebarProps {
  formState: FormState;
  savedProjects: SavedProject[];
  workspaceName: string;
  setWorkspaceName: (name: string) => void;
  currentProjectId: string | null;
  notification: string | null;
  onInputChange: (id: keyof FormState, value: string | number | boolean) => void;
  onNewProject: () => void;
  onSaveToWorkspace: (asNew: boolean) => void;
  onLoadProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onArchiveProject: (id: string) => void;
  onUnarchiveProject: (id: string) => void;
  onReorderProjects: (newOrder: SavedProject[]) => void;
  onClearWorkspace: () => void;
  onExportWorkspace: () => void;
  onImportWorkspace: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearCurrentForm: () => void;
  onExportFile: () => void;
  onFileLoad: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenPriceTable: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  formState, 
  savedProjects,
  workspaceName,
  setWorkspaceName,
  currentProjectId,
  notification,
  onInputChange, 
  onNewProject,
  onSaveToWorkspace,
  onLoadProject,
  onDeleteProject,
  onArchiveProject,
  onUnarchiveProject,
  onReorderProjects,
  onClearWorkspace,
  onExportWorkspace,
  onImportWorkspace,
  onClearCurrentForm,
  onExportFile, 
  onFileLoad, 
  onOpenPriceTable 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workspaceInputRef = useRef<HTMLInputElement>(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const selectedType = constructionTypes[formState.projectType];
  const category = formState.projectType.split('.')[0];
  const isCraneEligible = category === 'V' || category === 'VI';
  const showCoefficients = selectedType && category !== 'I' && category !== 'VII';

  const activeProjects = savedProjects.filter(p => !p.isArchived);
  const archivedProjects = savedProjects.filter(p => p.isArchived);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('bg-BG', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (index: number) => {
      setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (index: number) => {
      if (draggedItemIndex === null || draggedItemIndex === index) return;
      
      const newOrder = [...activeProjects];
      const draggedItem = newOrder[draggedItemIndex];
      
      // Remove dragged item
      newOrder.splice(draggedItemIndex, 1);
      // Insert at new position
      newOrder.splice(index, 0, draggedItem);

      // Combine active (reordered) + archived (unchanged) to update global state
      const fullList = [...newOrder, ...archivedProjects];
      onReorderProjects(fullList);
      setDraggedItemIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-4 right-4 lg:static lg:mb-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg z-50 transition-opacity animate-fade-in-up text-sm font-medium text-center">
            {notification}
        </div>
      )}

      {/* --- WORKSPACE CARD --- */}
      <Card className="flex flex-col">
        <CardHeader className="bg-bunker-50 dark:bg-bunker-800/50 border-b border-bunker-100 dark:border-bunker-700 pb-3">
             <h3 className="text-sm font-bold uppercase text-bunker-500 tracking-wider mb-2">Работно пространство</h3>
             <Input 
                label="Име на работното пространство" 
                id="workspaceName" 
                value={workspaceName}
                placeholder="Напр. Обект Младост 2023"
                onChange={(e) => setWorkspaceName(e.target.value)}
            />
            <div className="flex gap-2 mt-2">
                 <Button onClick={onExportWorkspace} variant="secondary" className="flex-1 text-xs py-1" title="Свали всички проекти в един файл">
                    <DownloadIcon className="h-4 w-4 mr-1"/> Експорт
                 </Button>
                 <Button onClick={() => workspaceInputRef.current?.click()} variant="secondary" className="flex-1 text-xs py-1" title="Зареди работно пространство от файл">
                    <FolderOpenIcon className="h-4 w-4 mr-1"/> Импорт
                 </Button>
                 <input 
                    type="file" 
                    id="loadWorkspace" 
                    ref={workspaceInputRef} 
                    accept=".json" 
                    className="hidden" 
                    onChange={onImportWorkspace} 
                 />
            </div>
        </CardHeader>
        
        <CardContent className="p-0">
            <div className="px-4 py-2 bg-white dark:bg-bunker-900 border-b border-bunker-100 dark:border-bunker-800 flex justify-between items-center">
                <span className="text-xs font-semibold text-bunker-500">Активни проекти ({activeProjects.length})</span>
                <div className="flex gap-2">
                     {savedProjects.length > 0 && (
                        <button 
                           type="button"
                           onClick={(e) => { e.stopPropagation(); onClearWorkspace(); }}
                           className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                           title="Изтрий всички проекти от списъка"
                        >
                           Изчисти всичко
                        </button>
                    )}
                </div>
            </div>

            {/* Modified max-height here to show approx 3 items */}
            <div className="max-h-[180px] overflow-y-auto custom-scrollbar">
                {activeProjects.length === 0 ? (
                    <div className="p-6 text-center text-sm text-bunker-400 flex flex-col items-center gap-2">
                        <span>Списъкът е празен.</span>
                        <span className="text-xs">Натиснете "Добави", за да добавите текущия проект.</span>
                    </div>
                ) : (
                    <ul className="divide-y divide-bunker-100 dark:divide-bunker-800">
                        {activeProjects.map((project, index) => (
                            <li 
                                key={project.id} 
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(index)}
                                onClick={() => onLoadProject(project.id)}
                                className={`px-2 py-3 cursor-pointer transition-all duration-200 hover:bg-bunker-50 dark:hover:bg-bunker-800 flex justify-between items-center group 
                                    ${currentProjectId === project.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}
                                    ${draggedItemIndex === index ? 'opacity-50 bg-bunker-100 dark:bg-bunker-700' : ''}
                                `}
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className="cursor-grab text-bunker-300 hover:text-bunker-500 active:cursor-grabbing p-1" onMouseDown={(e) => e.stopPropagation()}>
                                        <DragHandleIcon className="w-4 h-4" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className={`text-sm font-bold truncate ${currentProjectId === project.id ? 'text-blue-700 dark:text-blue-300' : 'text-bunker-700 dark:text-bunker-200'}`}>
                                            {project.name || 'Неозаглавен'}
                                        </p>
                                        <p className="text-xs text-bunker-400 dark:text-bunker-500">
                                            {formatDate(project.lastModified)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                    <button 
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); onArchiveProject(project.id); }}
                                        className="p-2 text-bunker-400 hover:text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded transition-all"
                                        title="Архивирай проект"
                                    >
                                        <ArchiveIcon className="h-4 w-4" />
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                                        className="p-2 text-bunker-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded transition-all"
                                        title="Изтрий проект"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
            {/* Archived Projects Section */}
            {archivedProjects.length > 0 && (
                <details className="group border-t border-bunker-100 dark:border-bunker-800">
                    <summary className="px-4 py-2 bg-bunker-50 dark:bg-bunker-800 cursor-pointer list-none flex justify-between items-center text-xs font-semibold text-bunker-500">
                        <span>Архивирани ({archivedProjects.length})</span>
                        <span className="transition-transform group-open:rotate-180">▼</span>
                    </summary>
                    <div className="max-h-[150px] overflow-y-auto bg-bunker-50/50 dark:bg-bunker-900/50">
                         <ul className="divide-y divide-bunker-100 dark:divide-bunker-800">
                            {archivedProjects.map((project) => (
                                <li 
                                    key={project.id} 
                                    className="px-4 py-2 flex justify-between items-center opacity-70 hover:opacity-100 transition-opacity"
                                >
                                    <div className="overflow-hidden">
                                        <p className="text-sm text-bunker-600 dark:text-bunker-400 truncate decoration-1">
                                            {project.name}
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                         <button 
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); onUnarchiveProject(project.id); }}
                                            className="p-1.5 text-bunker-400 hover:text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50 rounded transition-all"
                                            title="Възстанови проект"
                                        >
                                            <UnarchiveIcon className="h-4 w-4" />
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                                            className="p-1.5 text-bunker-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded transition-all"
                                            title="Изтрий проект завинаги"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </details>
            )}

             <div className="p-2 border-t border-bunker-100 dark:border-bunker-800">
                 <Button onClick={onNewProject} variant="primary" className="w-full text-sm">
                    + Нов празен проект
                </Button>
             </div>
        </CardContent>
      </Card>

      {/* --- CURRENT PROJECT CARD --- */}
      <Card>
        <CardHeader className="flex items-center justify-between pb-2">
             <span>Текущ проект</span>
             {currentProjectId && <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">Редактиране</span>}
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <Input
            label="Име на проекта"
            id="objectName"
            type="text"
            placeholder="Автоматично (Дата + Час)"
            value={formState.objectName}
            onChange={(e) => onInputChange('objectName', e.target.value)}
          />
          
          <div className="space-y-3">
             {/* Main Save Actions */}
             <div className="grid grid-cols-1 gap-2">
                {currentProjectId ? (
                    <div className="flex gap-2">
                        <Button onClick={() => onSaveToWorkspace(false)} Icon={SaveIcon} className="flex-1">
                            Запази промените
                        </Button>
                        <Button onClick={() => onSaveToWorkspace(true)} variant="secondary" className="flex-1 text-xs">
                            Запази като нов
                        </Button>
                    </div>
                ) : (
                    <Button onClick={() => onSaveToWorkspace(true)} Icon={SaveIcon} className="w-full">
                        Добави в списъка
                    </Button>
                )}
             </div>
             
             <div className="h-px bg-bunker-200 dark:bg-bunker-700 my-2"></div>
             
             {/* Secondary Actions */}
             <div className="grid grid-cols-2 gap-2">
                 <Button onClick={onClearCurrentForm} variant="secondary" className="text-xs" title="Изчисти само полетата на формата">
                    <XIcon className="h-4 w-4 mr-1" /> Изчисти форма
                </Button>
                <div className="flex gap-1">
                    <Button onClick={onExportFile} variant="secondary" className="flex-1 text-xs px-1" title="Свали само този проект">
                       JSON Експорт
                    </Button>
                    <Button onClick={() => fileInputRef.current?.click()} variant="secondary" className="flex-1 text-xs px-1" title="Зареди един или няколко файла">
                       JSON Импорт
                    </Button>
                </div>
                <input type="file" id="loadInput" ref={fileInputRef} accept=".json" multiple className="hidden" onChange={onFileLoad} />
             </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>Настройки</CardHeader>
        <CardContent className="space-y-4">
            <Button onClick={onOpenPriceTable} Icon={TableIcon} className="w-full" variant="secondary">Отвори таблица с цени</Button>
            <Select
                label="Валута"
                id="currencyDisplay"
                value={formState.currencyDisplay}
                onChange={(e) => onInputChange('currencyDisplay', e.target.value)}
            >
                <option value="eur">в евро (€)</option>
                <option value="bgn">в лева (лв.)</option>
                <option value="both">в лева и евро</option>
            </Select>
        </CardContent>
      </Card>

      {showCoefficients && (
        <Card>
          <CardHeader>Допълнителни коефициенти</CardHeader>
          <CardContent className="space-y-4">
            {isCraneEligible && (
              <Checkbox
                id="hasCrane"
                label="Хале с кран (+1.00 €/м²)"
                checked={formState.hasCrane}
                onChange={(e) => onInputChange('hasCrane', e.target.checked)}
              />
            )}
            <Checkbox
              id="hasComplexity"
              label="Сложна геометрия/терен"
              checked={formState.hasComplexity}
              onChange={(e) => onInputChange('hasComplexity', e.target.checked)}
            />
            {formState.hasComplexity && (
               <Input
                    label="Процент оскъпяване (+%)"
                    id="complexityPercentage"
                    type="number"
                    min="0" max="100"
                    placeholder="напр. 15"
                    value={formState.complexityPercentage > 0 ? formState.complexityPercentage : ''}
                    onChange={(e) => onInputChange('complexityPercentage', e.target.valueAsNumber || 0)}
                />
            )}
             <Checkbox
              id="isAccelerated"
              label="Ускорено проектиране (+50%)"
              checked={formState.isAccelerated}
              onChange={(e) => onInputChange('isAccelerated', e.target.checked)}
            />
            <Checkbox
              id="includeSupervision"
              label="Авторски надзор (+15%)"
              checked={formState.includeSupervision}
              onChange={(e) => onInputChange('includeSupervision', e.target.checked)}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Sidebar;
