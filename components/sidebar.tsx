'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, FolderPlus, Trash2, LogOut, ChevronDown, ChevronUp, X } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSectionStore } from '@/lib/store/section-store'
import { useLessonStore } from '@/lib/store/lesson-store'
import { DeleteConfirmation } from '@/components/delete-confirmation'
import * as Icons from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuthStore } from '@/lib/store/auth-store'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [newSectionName, setNewSectionName] = useState('')
  const [showNewSectionDialog, setShowNewSectionDialog] = useState(false)
  const [newSubsectionName, setNewSubsectionName] = useState('')
  const [activeSectionForSubsection, setActiveSectionForSubsection] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean
    type: 'section' | 'subsection'
    id: string
    sectionId?: string
    requireTyping: boolean
  } | null>(null)
  const { toast } = useToast()
  
  const { sections, addSection, addSubsection, removeSection, removeSubsection } = useSectionStore()
  const { lessons, currentSection, currentSubsection, setCurrentSection, setCurrentSubsection } = useLessonStore()
  const { signOut } = useAuthStore()

  const handleAddSection = () => {
    if (newSectionName.trim()) {
      addSection(newSectionName.trim(), 'book')
      setNewSectionName('')
      setShowNewSectionDialog(false)
    }
  }

  const handleAddSubsection = (sectionId: string) => {
    if (newSubsectionName.trim()) {
      try {
        addSubsection(sectionId, newSubsectionName.trim())
        setNewSubsectionName('')
        setActiveSectionForSubsection(null)
        toast({
          title: 'Success',
          description: 'Subsection added successfully'
        })
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to add subsection. Please try again.',
          variant: 'destructive'
        })
      }
    }
  }

  const handleSectionClick = (sectionId: string) => {
    setCurrentSection(sectionId)
    setCurrentSubsection(null)
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId) // Collapse if already expanded
      } else {
        newSet.add(sectionId) // Expand if collapsed
      }
      return newSet
    })
  }

  const handleSubsectionClick = (sectionId: string, subsectionId: string) => {
    setCurrentSection(sectionId)
    setCurrentSubsection(subsectionId)
  }

  const handleDeleteClick = (type: 'section' | 'subsection', id: string, sectionId?: string) => {
    const isSection = type === 'section'
    const items = isSection
      ? lessons.filter((lesson) => lesson.section_id === id)
      : lessons.filter((lesson) => lesson.section_id === sectionId && lesson.subsection_id === id)
    
    setDeleteConfirmation({
      open: true,
      type,
      id,
      sectionId,
      requireTyping: items.length > 0
    })
  }

  const handleDeleteConfirm = () => {
    if (!deleteConfirmation) return

    if (deleteConfirmation.type === 'section') {
      removeSection(deleteConfirmation.id)
      if (currentSection === deleteConfirmation.id) {
        setCurrentSection(sections[0]?.id || '')
        setCurrentSubsection(null)
      }
    } else {
      removeSubsection(deleteConfirmation.sectionId!, deleteConfirmation.id)
      if (currentSubsection === deleteConfirmation.id) {
        setCurrentSubsection(null)
      }
    }
    setDeleteConfirmation(null)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: 'Signed out successfully',
        description: 'You have been logged out of your account.'
      })
    } catch (error) {
      toast({
        title: 'Error signing out',
        description: 'There was a problem signing out. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const toggleSectionExpansion = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination } = result

    if (source.droppableId === destination.droppableId) {
      // Reorder within the same list
      if (source.droppableId === 'sections') {
        const reorderedSections = Array.from(sections)
        const [movedSection] = reorderedSections.splice(source.index, 1)
        reorderedSections.splice(destination.index, 0, movedSection)
        // Update the store with the new order
        // You might need to update the backend as well
      } else {
        const section = sections.find(s => s.id === source.droppableId)
        if (section) {
          const reorderedSubsections = Array.from(section.subsections || [])
          const [movedSubsection] = reorderedSubsections.splice(source.index, 1)
          reorderedSubsections.splice(destination.index, 0, movedSubsection)
          // Update the store with the new order
          // You might need to update the backend as well
        }
      }
    }
  }

  return (
    <div
      className={cn(
        'h-screen bg-card border-r transition-all duration-300 relative',
        isExpanded || isPinned ? 'w-64' : 'w-16',
        !isPinned && 'hover:w-64'
      )}
      onMouseEnter={() => !isPinned && setIsExpanded(true)}
      onMouseLeave={() => !isPinned && setIsExpanded(false)}
    >
      <div className="p-4 flex flex-col h-full">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={() => setIsPinned(!isPinned)}
        >
          {isPinned ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>

        <Dialog open={showNewSectionDialog} onOpenChange={setShowNewSectionDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full mt-8 mb-4',
                !isExpanded && !isPinned && 'w-8 p-0'
              )}
            >
              <Plus className="h-4 w-4" />
              {(isExpanded || isPinned) && <span className="ml-2">New Section</span>}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Section</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="section-name">Section Name</Label>
                <Input
                  id="section-name"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="Enter section name"
                />
              </div>
              <Button onClick={handleAddSection} className="w-full">
                Add Section
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="sections" type="SECTION">
            {(provided) => (
              <nav className="space-y-2 flex-1" ref={provided.innerRef} {...provided.droppableProps}>
                {sections.map((section, index) => (
                  <Draggable key={section.id} draggableId={section.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="space-y-1"
                      >
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            className={cn(
                              'flex-1 justify-start overflow-hidden text-ellipsis whitespace-nowrap',
                              !isExpanded && !isPinned && 'justify-center',
                              currentSection === section.id && !currentSubsection && 'bg-accent'
                            )}
                            onClick={() => handleSectionClick(section.id)}
                          >
                            {/* @ts-ignore */}
                            {Icons[section.icon] && React.createElement(Icons[section.icon], {
                              className: 'h-5 w-5 mr-2',
                            })}
                            {(isExpanded || isPinned) && <span>{section.name}</span>}
                          </Button>
                          {(isExpanded || isPinned) && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setActiveSectionForSubsection(section.id)}
                              >
                                <FolderPlus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick('section', section.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleSectionExpansion(section.id)}
                              >
                                {expandedSections.has(section.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                            </>
                          )}
                        </div>

                        {activeSectionForSubsection === section.id && (isExpanded || isPinned) && (
                          <div className="ml-6 flex items-center gap-2">
                            <Input
                              value={newSubsectionName}
                              onChange={(e) => setNewSubsectionName(e.target.value)}
                              placeholder="Subsection name"
                              className="h-8"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleAddSubsection(section.id)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setActiveSectionForSubsection(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}

                        {expandedSections.has(section.id) && (isExpanded || isPinned) && (
                          <Droppable droppableId={section.id} type="SUBSECTION">
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.droppableProps}>
                                {section.subsections?.map((subsection, subIndex) => (
                                  <Draggable key={subsection.id} draggableId={subsection.id} index={subIndex}>
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="flex items-center gap-1 pl-6"
                                      >
                                        <Button
                                          variant="ghost"
                                          className={cn(
                                            'flex-1 justify-start overflow-hidden text-ellipsis whitespace-nowrap',
                                            currentSection === section.id &&
                                            currentSubsection === subsection.id &&
                                            'bg-accent'
                                          )}
                                          onClick={() => handleSubsectionClick(section.id, subsection.id)}
                                        >
                                          {subsection.name}
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleDeleteClick('subsection', subsection.id, section.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </nav>
            )}
          </Droppable>
        </DragDropContext>

        <Button
          variant="ghost"
          className={cn(
            'mt-auto w-full justify-start',
            !isExpanded && !isPinned && 'justify-center'
          )}
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          {(isExpanded || isPinned) && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>

      {deleteConfirmation && (
        <DeleteConfirmation
          open={deleteConfirmation.open}
          onOpenChange={(open) => !open && setDeleteConfirmation(null)}
          onConfirm={handleDeleteConfirm}
          title={`Delete ${deleteConfirmation.type === 'section' ? 'Section' : 'Subsection'}`}
          description={
            deleteConfirmation.requireTyping
              ? `This ${deleteConfirmation.type} contains lessons that will also be deleted. Type "Delete" to confirm.`
              : `Are you sure you want to delete this ${deleteConfirmation.type}?`
          }
          requireTyping={deleteConfirmation.requireTyping}
        />
      )}
    </div>
  )
}
