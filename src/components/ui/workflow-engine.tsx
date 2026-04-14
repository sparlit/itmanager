import * as React from "react";
import { 
  CheckCircle, 
  Loader2, 
  Clock, 
  Users, 
  Flag, 
  Package,
  Github,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  assignee?: string;
  dueDate?: string;
  dependencies?: string[];
  metadata?: Record<string, any>;
}

interface WorkflowEngineProps {
  workflowId: string;
  title: string;
  steps: WorkflowStep[];
  onStepUpdate?: (stepId: string, updates: Partial<WorkflowStep>) => void;
  onAddStep?: (step: Omit<WorkflowStep, 'id'>) => void;
  canEdit?: boolean;
}

export function WorkflowEngine({
  workflowId,
  title,
  steps,
  onStepUpdate,
  onAddStep,
  canEdit = false,
}: WorkflowEngineProps) {
  const [loading, setLoading] = React.useState(false);

  const handleStepUpdate = async (stepId: string, updates: Partial<WorkflowStep>) => {
    setLoading(true);
    try {
      onStepUpdate?.(stepId, updates);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStep = async () => {
    setLoading(true);
    try {
      onAddStep?.({
        title: `New Step ${steps.length + 1}`,
        description: '',
        status: 'pending',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return <Badge variant="secondary">Completed</Badge>;
      case 'in-progress': return <Badge variant="default">In Progress</Badge>;
      case 'blocked': return <Badge variant="destructive">Blocked</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/50">
                    {step.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : step.status === 'in-progress' ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : step.status === 'blocked' ? (
                      <Flag className="h-4 w-4 text-destructive" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{step.title}</h3>
                      {getStatusBadge(step.status)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {step.description}
                    </p>
                    {step.assignee || step.dueDate ? (
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        {step.assignee && (
                          <>
                            <Users className="h-4 w-4 me-1" />
                            <span>{step.assignee}</span>
                          </>
                        )}
                        {step.dueDate && (
                          <>
                            <Clock className="h-4 w-4 me-1" />
                            <span>{new Date(step.dueDate).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    ) : null}
                    {step.dependencies?.length ? (
                      <div className="mt-2">
                        <span className="font-medium text-xs text-muted-foreground">Dependencies:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {step.dependencies.map(depId => {
                            const depStep = steps.find(s => s.id === depId);
                            return (
                              <Badge key={depId} variant="outline" size="xs">
                                {depStep?.title || depId}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  {canEdit ? (
                    <div className="flex items-center space-x-2 text-xs">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStepUpdate(step.id, { status: 'completed' })}
                        disabled={loading}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStepUpdate(step.id, { status: 'in-progress' })}
                        disabled={loading}
                      >
                        <Loader2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStepUpdate(step.id, { status: 'blocked' })}
                        disabled={loading}
                      >
                        <Flag className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ) : null}
                </div>
                {!canEdit && step.status === 'pending' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => handleStepUpdate(step.id, { status: 'in-progress' })}
                    disabled={loading}
                  >
                    Start Step
                  </Button>
                ) : null}
              </div>
            ))}
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleAddStep}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 mr-2" /> : null}
                Add Step
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Workflow Summary */}
      <Card className="border">
        <CardHeader className="pb-4">
          <h3 className="text-lg font-semibold">Workflow Summary</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <p className="text-sm font-medium text-muted-foreground">Total Steps</p>
              <p className="text-2xl font-bold">{steps.length}</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-success">
                {steps.filter(s => s.status === 'completed').length}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm font-medium text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-primary">
                {steps.filter(s => s.status === 'in-progress').length}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm font-medium text-muted-foreground">Blocked</p>
              <p className="text-2xl font-bold text-destructive">
                {steps.filter(s => s.status === 'blocked').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}