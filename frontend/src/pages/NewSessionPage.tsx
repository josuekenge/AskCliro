import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Check, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { cn } from '../lib/utils';
import { sessionsApi, ApiError } from '../services';

const steps = [
  { id: 'patient', title: 'Patient Info' },
  { id: 'complaint', title: 'Chief Complaint' },
  { id: 'history', title: 'Medical History' },
];

interface FormData {
  patient_name: string;
  patient_age: string;
  patient_sex: string;
  chief_complaint: string;
  complaint_duration: string;
  severity: string;
  allergies: string[];
  conditions: string[];
  current_medications: string;
  additional_notes: string;
}

const COMMON_ALLERGIES = ['Penicillin', 'Sulfa drugs', 'Aspirin', 'Ibuprofen', 'Latex', 'None known'];
const COMMON_CONDITIONS = ['Hypertension', 'Diabetes', 'Asthma', 'Heart disease', 'COPD', 'Depression'];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const contentVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
};

export const NewSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<FormData>({
    patient_name: '',
    patient_age: '',
    patient_sex: '',
    chief_complaint: '',
    complaint_duration: '',
    severity: '',
    allergies: [],
    conditions: [],
    current_medications: '',
    additional_notes: '',
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const toggleItem = (field: 'allergies' | 'conditions', item: string) => {
    setFormData((prev) => {
      const list = [...prev[field]];
      return {
        ...prev,
        [field]: list.includes(item) ? list.filter((i) => i !== item) : [...list, item],
      };
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep((p) => p + 1);
  };
  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((p) => p - 1);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return formData.patient_name.trim() !== '';
      case 1: return formData.chief_complaint.trim() !== '';
      default: return true;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const session = await sessionsApi.create({
        patient_name: formData.patient_name.trim(),
        patient_age: formData.patient_age ? parseInt(formData.patient_age) : undefined,
        patient_sex: formData.patient_sex || undefined,
        chief_complaint: [
          formData.chief_complaint.trim(),
          formData.complaint_duration ? `Duration: ${formData.complaint_duration}` : '',
          formData.severity ? `Severity: ${formData.severity}` : '',
        ].filter(Boolean).join(' — '),
        allergies: formData.allergies.filter((a) => a !== 'None known'),
        conditions: formData.conditions,
      });
      navigate(`/session/${session.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail);
      } else {
        setError('Failed to create session. Is the backend running?');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: 'linear-gradient(145deg, #e4e8f1, #dde1ec, #e8ebf3, #dfe3ee)' }}>

      {/* Header */}
      <header className="h-12 flex items-center px-5 glass-strong border-b border-white/30 shrink-0">
        <Button variant="ghost" size="icon" className="h-7 w-7 mr-3" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-[14px] font-semibold tracking-tight">
          <span>Ask</span>
          <span className="text-[hsl(var(--primary))]">Cliro</span>
        </span>
        <span className="text-[hsl(var(--muted-foreground))] text-[13px] ml-4">New Session</span>
      </header>

      {/* Form */}
      <div className="flex-1 overflow-y-auto flex items-start justify-center pt-10 pb-8 px-6">
        <div className="w-full max-w-lg">

          {/* Progress */}
          <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex justify-between mb-2">
              {steps.map((step, index) => (
                <motion.div key={index} className="flex flex-col items-center" whileHover={{ scale: 1.1 }}>
                  <motion.div
                    className={cn(
                      "w-4 h-4 rounded-full cursor-pointer transition-colors duration-300",
                      index < currentStep ? "bg-[hsl(var(--primary))]" :
                      index === currentStep ? "bg-[hsl(var(--primary))] ring-4 ring-[hsl(var(--primary))]/20" :
                      "bg-[hsl(var(--muted))]"
                    )}
                    onClick={() => { if (index <= currentStep) setCurrentStep(index); }}
                    whileTap={{ scale: 0.95 }}
                  />
                  <motion.span className={cn("text-xs mt-1.5", index === currentStep ? "text-[hsl(var(--primary))] font-medium" : "text-[hsl(var(--muted-foreground))]")}>
                    {step.title}
                  </motion.span>
                </motion.div>
              ))}
            </div>
            <div className="w-full bg-[hsl(var(--muted))] h-1.5 rounded-full overflow-hidden mt-2">
              <motion.div
                className="h-full bg-[hsl(var(--primary))]"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-[12px] px-3 py-2.5 rounded-lg mb-5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Card className="border shadow-md rounded-2xl overflow-hidden bg-white">
              <AnimatePresence mode="wait">
                <motion.div key={currentStep} initial="hidden" animate="visible" exit="exit" variants={contentVariants}>

                  {/* Step 1: Patient Info */}
                  {currentStep === 0 && (
                    <>
                      <CardHeader>
                        <CardTitle className="text-lg">Patient Information</CardTitle>
                        <CardDescription>Basic details about the patient</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label htmlFor="name">Full Name *</Label>
                          <Input id="name" placeholder="e.g. John Martinez" value={formData.patient_name} onChange={(e) => updateField('patient_name', e.target.value)} />
                        </motion.div>
                        <div className="grid grid-cols-2 gap-3">
                          <motion.div variants={fadeInUp} className="space-y-2">
                            <Label htmlFor="age">Age</Label>
                            <Input id="age" type="number" placeholder="—" min="0" max="150" value={formData.patient_age} onChange={(e) => updateField('patient_age', e.target.value)} />
                          </motion.div>
                          <motion.div variants={fadeInUp} className="space-y-2">
                            <Label>Sex</Label>
                            <Select value={formData.patient_sex} onValueChange={(v) => updateField('patient_sex', v)}>
                              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="M">Male</SelectItem>
                                <SelectItem value="F">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </motion.div>
                        </div>
                      </CardContent>
                    </>
                  )}

                  {/* Step 2: Chief Complaint */}
                  {currentStep === 1 && (
                    <>
                      <CardHeader>
                        <CardTitle className="text-lg">Chief Complaint</CardTitle>
                        <CardDescription>What brings the patient in today?</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label htmlFor="complaint">Primary complaint *</Label>
                          <Textarea
                            id="complaint"
                            placeholder="e.g. Sharp chest pain for 3 days, worse with deep breathing"
                            value={formData.chief_complaint}
                            onChange={(e) => updateField('chief_complaint', e.target.value)}
                            className="min-h-[80px] bg-white"
                          />
                        </motion.div>
                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label>How long has this been going on?</Label>
                          <RadioGroup value={formData.complaint_duration} onValueChange={(v) => updateField('complaint_duration', v)} className="space-y-1.5">
                            {['Today', 'A few days', '1-2 weeks', 'More than a month', 'Chronic / recurring'].map((d, i) => (
                              <motion.div key={d} className="flex items-center space-x-2 rounded-md border border-[hsl(var(--border))] p-2.5 cursor-pointer hover:bg-[hsl(var(--accent))] transition-colors"
                                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.08 * i, duration: 0.25 } }}
                              >
                                <RadioGroupItem value={d} id={`dur-${i}`} />
                                <Label htmlFor={`dur-${i}`} className="cursor-pointer w-full text-[13px]">{d}</Label>
                              </motion.div>
                            ))}
                          </RadioGroup>
                        </motion.div>
                      </CardContent>
                    </>
                  )}

                  {/* Step 3: Medical History */}
                  {currentStep === 2 && (
                    <>
                      <CardHeader>
                        <CardTitle className="text-lg">Medical History</CardTitle>
                        <CardDescription>Known allergies, conditions, and medications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label>Known Allergies</Label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {COMMON_ALLERGIES.map((allergy, i) => (
                              <motion.div key={allergy}
                                className="flex items-center space-x-2 rounded-md border border-[hsl(var(--border))] p-2 cursor-pointer hover:bg-[hsl(var(--accent))] transition-colors"
                                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.04 * i, duration: 0.25 } }}
                                onClick={() => toggleItem('allergies', allergy)}
                              >
                                <Checkbox checked={formData.allergies.includes(allergy)} onCheckedChange={() => toggleItem('allergies', allergy)} />
                                <Label className="cursor-pointer w-full text-[12px]">{allergy}</Label>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label>Existing Conditions</Label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {COMMON_CONDITIONS.map((cond, i) => (
                              <motion.div key={cond}
                                className="flex items-center space-x-2 rounded-md border border-[hsl(var(--border))] p-2 cursor-pointer hover:bg-[hsl(var(--accent))] transition-colors"
                                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.04 * i, duration: 0.25 } }}
                                onClick={() => toggleItem('conditions', cond)}
                              >
                                <Checkbox checked={formData.conditions.includes(cond)} onCheckedChange={() => toggleItem('conditions', cond)} />
                                <Label className="cursor-pointer w-full text-[12px]">{cond}</Label>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label htmlFor="meds">Current Medications (optional)</Label>
                          <Input id="meds" placeholder="e.g. Lisinopril 10mg, Metformin 500mg" value={formData.current_medications} onChange={(e) => updateField('current_medications', e.target.value)} />
                        </motion.div>
                      </CardContent>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 pb-5 pt-3">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0} className="flex items-center gap-1 rounded-xl">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    type="button"
                    onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
                    disabled={!isStepValid() || isSubmitting}
                    className="flex items-center gap-1 rounded-xl"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Starting...</>
                    ) : currentStep === steps.length - 1 ? (
                      <><span>Start Session</span><Check className="h-4 w-4" /></>
                    ) : (
                      <><span>Next</span><ChevronRight className="h-4 w-4" /></>
                    )}
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>

          <motion.div className="mt-4 text-center text-[11px] text-[hsl(var(--muted-foreground))]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NewSessionPage;
