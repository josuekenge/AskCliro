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
  { id: 'patient', title: 'Patient' },
  { id: 'complaint', title: 'Complaint' },
  { id: 'history', title: 'History' },
  { id: 'review', title: 'Review of Systems' },
  { id: 'social', title: 'Social / Family' },
  { id: 'vitals', title: 'Vitals' },
];

interface FormData {
  // Step 1 — Patient
  patient_name: string;
  patient_age: string;
  patient_sex: string;
  dob: string;
  blood_type: string;

  // Step 2 — Chief Complaint
  chief_complaint: string;
  complaint_duration: string;
  severity: string;
  onset: string;
  aggravating_factors: string;
  relieving_factors: string;
  associated_symptoms: string;

  // Step 3 — Medical History
  allergies: string[];
  allergy_other: string;
  conditions: string[];
  condition_other: string;
  current_medications: string;
  past_surgeries: string;
  hospitalizations: string;

  // Step 4 — Review of Systems
  ros_positive: string[];
  ros_notes: string;

  // Step 5 — Social / Family
  smoking: string;
  alcohol: string;
  drugs: string;
  occupation: string;
  exercise: string;
  family_history: string[];
  family_other: string;

  // Step 6 — Vitals (optional pre-fill)
  bp: string;
  heart_rate: string;
  temperature: string;
  spo2: string;
  respiratory_rate: string;
  weight: string;
}

const ALLERGIES = ['Penicillin', 'Sulfa drugs', 'Aspirin / NSAIDs', 'Latex', 'Codeine', 'ACE Inhibitors', 'Contrast dye', 'None known'];
const CONDITIONS = ['Hypertension', 'Diabetes Type 2', 'Diabetes Type 1', 'Asthma', 'COPD', 'Heart disease / CAD', 'Heart failure', 'Atrial fibrillation', 'Stroke / TIA', 'Chronic kidney disease', 'Thyroid disorder', 'Depression / Anxiety', 'Cancer (specify below)', 'Seizure disorder'];
const ROS_ITEMS = [
  'Fever / chills', 'Fatigue', 'Unintentional weight change',
  'Headache', 'Dizziness', 'Vision changes',
  'Chest pain', 'Palpitations', 'Shortness of breath', 'Cough', 'Wheezing',
  'Nausea / vomiting', 'Abdominal pain', 'Diarrhea', 'Constipation', 'Blood in stool',
  'Painful urination', 'Urinary frequency', 'Blood in urine',
  'Joint pain', 'Muscle weakness', 'Back pain', 'Swelling in extremities',
  'Rash', 'Skin changes', 'Easy bruising',
  'Numbness / tingling', 'Tremor', 'Memory changes',
  'Depressed mood', 'Anxiety', 'Sleep disturbance',
];
const FAMILY_CONDITIONS = ['Heart disease', 'Diabetes', 'Cancer', 'Stroke', 'Hypertension', 'Mental illness', 'Blood disorders', 'Autoimmune disease'];

const contentVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
};
const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export const NewSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<FormData>({
    patient_name: '', patient_age: '', patient_sex: '', dob: '', blood_type: '',
    chief_complaint: '', complaint_duration: '', severity: '', onset: '', aggravating_factors: '', relieving_factors: '', associated_symptoms: '',
    allergies: [], allergy_other: '', conditions: [], condition_other: '', current_medications: '', past_surgeries: '', hospitalizations: '',
    ros_positive: [], ros_notes: '',
    smoking: '', alcohol: '', drugs: '', occupation: '', exercise: '', family_history: [], family_other: '',
    bp: '', heart_rate: '', temperature: '', spo2: '', respiratory_rate: '', weight: '',
  });

  const set = (field: keyof FormData, value: string) => { setForm((p) => ({ ...p, [field]: value })); setError(''); };
  const toggle = (field: 'allergies' | 'conditions' | 'ros_positive' | 'family_history', item: string) => {
    setForm((p) => {
      const list = [...(p[field] as string[])];
      return { ...p, [field]: list.includes(item) ? list.filter((i) => i !== item) : [...list, item] };
    });
  };

  const nextStep = () => { if (currentStep < steps.length - 1) setCurrentStep((p) => p + 1); };
  const prevStep = () => { if (currentStep > 0) setCurrentStep((p) => p - 1); };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return form.patient_name.trim() !== '';
      case 1: return form.chief_complaint.trim() !== '';
      default: return true;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const complaintParts = [
        form.chief_complaint.trim(),
        form.complaint_duration ? `Duration: ${form.complaint_duration}` : '',
        form.severity ? `Severity: ${form.severity}/10` : '',
        form.onset ? `Onset: ${form.onset}` : '',
      ].filter(Boolean).join(' — ');

      const session = await sessionsApi.create({
        patient_name: form.patient_name.trim(),
        patient_age: form.patient_age ? parseInt(form.patient_age) : undefined,
        patient_sex: form.patient_sex || undefined,
        chief_complaint: complaintParts,
        allergies: form.allergies.filter((a) => a !== 'None known').concat(form.allergy_other ? [form.allergy_other] : []),
        conditions: form.conditions.concat(form.condition_other ? [form.condition_other] : []),
        medications: form.current_medications ? form.current_medications.split(',').map((s) => s.trim()).filter(Boolean) : [],
      });
      navigate(`/session/${session.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : 'Failed to create session. Is the backend running?');
      setIsSubmitting(false);
    }
  };

  const CheckboxGrid: React.FC<{ items: string[]; selected: string[]; field: 'allergies' | 'conditions' | 'ros_positive' | 'family_history'; cols?: number }> = ({ items, selected, field, cols = 2 }) => (
    <div className={`grid gap-1.5 ${cols === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
      {items.map((item, i) => (
        <motion.div key={item}
          className="flex items-center space-x-2 rounded-md border border-[hsl(var(--border))] p-2 cursor-pointer hover:bg-[hsl(var(--accent))] transition-colors"
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.02 * i, duration: 0.2 } }}
          onClick={() => toggle(field, item)}
        >
          <Checkbox checked={selected.includes(item)} onCheckedChange={() => toggle(field, item)} />
          <Label className="cursor-pointer w-full text-[11.5px] leading-tight">{item}</Label>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="h-screen flex flex-col" style={{ background: 'linear-gradient(145deg, #e4e8f1, #dde1ec, #e8ebf3, #dfe3ee)' }}>

      <header className="h-12 flex items-center px-5 glass-strong border-b border-white/30 shrink-0">
        <Button variant="ghost" size="icon" className="h-7 w-7 mr-3" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-[14px] font-semibold tracking-tight">
          <span>Ask</span><span className="text-[hsl(var(--primary))]">Cliro</span>
        </span>
        <span className="text-[hsl(var(--muted-foreground))] text-[13px] ml-4">New Session</span>
      </header>

      <div className="flex-1 overflow-y-auto flex items-start justify-center pt-8 pb-8 px-6">
        <div className="w-full max-w-xl">

          {/* Progress */}
          <motion.div className="mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex justify-between mb-2">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center">
                  <motion.div
                    className={cn("w-3.5 h-3.5 rounded-full cursor-pointer transition-colors duration-300",
                      index < currentStep ? "bg-[hsl(var(--primary))]" :
                      index === currentStep ? "bg-[hsl(var(--primary))] ring-4 ring-[hsl(var(--primary))]/20" :
                      "bg-[hsl(var(--muted))]"
                    )}
                    onClick={() => { if (index <= currentStep) setCurrentStep(index); }}
                    whileTap={{ scale: 0.95 }}
                  />
                  <span className={cn("text-[9px] mt-1 hidden sm:block", index === currentStep ? "text-[hsl(var(--primary))] font-medium" : "text-[hsl(var(--muted-foreground))]")}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
            <div className="w-full bg-[hsl(var(--muted))] h-1 rounded-full overflow-hidden mt-1">
              <motion.div className="h-full bg-[hsl(var(--primary))]" animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }} transition={{ duration: 0.3 }} />
            </div>
          </motion.div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-[12px] px-3 py-2.5 rounded-lg mb-4">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Card className="border shadow-md rounded-2xl overflow-hidden bg-white">
              <AnimatePresence mode="wait">
                <motion.div key={currentStep} initial="hidden" animate="visible" exit="exit" variants={contentVariants}>

                  {/* Step 1: Patient Info */}
                  {currentStep === 0 && (
                    <>
                      <CardHeader><CardTitle className="text-lg">Patient Information</CardTitle><CardDescription>Demographics and identification</CardDescription></CardHeader>
                      <CardContent className="space-y-3">
                        <motion.div variants={fadeInUp} className="space-y-1.5">
                          <Label>Full Name *</Label>
                          <Input placeholder="e.g. John Martinez" value={form.patient_name} onChange={(e) => set('patient_name', e.target.value)} />
                        </motion.div>
                        <div className="grid grid-cols-3 gap-3">
                          <motion.div variants={fadeInUp} className="space-y-1.5">
                            <Label>Age</Label>
                            <Input type="number" placeholder="—" min="0" max="150" value={form.patient_age} onChange={(e) => set('patient_age', e.target.value)} />
                          </motion.div>
                          <motion.div variants={fadeInUp} className="space-y-1.5">
                            <Label>Sex</Label>
                            <Select value={form.patient_sex} onValueChange={(v) => set('patient_sex', v)}>
                              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="M">Male</SelectItem>
                                <SelectItem value="F">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </motion.div>
                          <motion.div variants={fadeInUp} className="space-y-1.5">
                            <Label>Blood Type</Label>
                            <Select value={form.blood_type} onValueChange={(v) => set('blood_type', v)}>
                              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                              <SelectContent>
                                {['A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </motion.div>
                        </div>
                        <motion.div variants={fadeInUp} className="space-y-1.5">
                          <Label>Date of Birth</Label>
                          <Input type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)} />
                        </motion.div>
                      </CardContent>
                    </>
                  )}

                  {/* Step 2: Chief Complaint — OLDCARTS */}
                  {currentStep === 1 && (
                    <>
                      <CardHeader><CardTitle className="text-lg">Chief Complaint</CardTitle><CardDescription>What brings the patient in today? (OLDCARTS framework)</CardDescription></CardHeader>
                      <CardContent className="space-y-3">
                        <motion.div variants={fadeInUp} className="space-y-1.5">
                          <Label>Primary complaint *</Label>
                          <Textarea placeholder="e.g. Sharp chest pain for 3 days, worse with deep breathing" value={form.chief_complaint} onChange={(e) => set('chief_complaint', e.target.value)} className="min-h-[70px] bg-white" />
                        </motion.div>
                        <div className="grid grid-cols-2 gap-3">
                          <motion.div variants={fadeInUp} className="space-y-1.5">
                            <Label>Onset</Label>
                            <Select value={form.onset} onValueChange={(v) => set('onset', v)}>
                              <SelectTrigger><SelectValue placeholder="When did it start?" /></SelectTrigger>
                              <SelectContent>
                                {['Sudden', 'Gradual', 'Intermittent', 'Worsening over time'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </motion.div>
                          <motion.div variants={fadeInUp} className="space-y-1.5">
                            <Label>Duration</Label>
                            <Select value={form.complaint_duration} onValueChange={(v) => set('complaint_duration', v)}>
                              <SelectTrigger><SelectValue placeholder="How long?" /></SelectTrigger>
                              <SelectContent>
                                {['Hours', '1-2 days', '3-7 days', '1-2 weeks', '2-4 weeks', 'More than a month', 'Chronic / recurring'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </motion.div>
                        </div>
                        <motion.div variants={fadeInUp} className="space-y-1.5">
                          <Label>Severity (1-10)</Label>
                          <div className="flex gap-1">
                            {[1,2,3,4,5,6,7,8,9,10].map(n => (
                              <button key={n} type="button" onClick={() => set('severity', String(n))}
                                className={cn("flex-1 h-8 rounded-md text-[11px] font-medium transition-all border",
                                  form.severity === String(n)
                                    ? n <= 3 ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : n <= 6 ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-red-100 border-red-300 text-red-700'
                                    : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]'
                                )}
                              >{n}</button>
                            ))}
                          </div>
                        </motion.div>
                        <motion.div variants={fadeInUp} className="space-y-1.5">
                          <Label>What makes it worse? (Aggravating factors)</Label>
                          <Input placeholder="e.g. Deep breathing, lying down, exertion" value={form.aggravating_factors} onChange={(e) => set('aggravating_factors', e.target.value)} />
                        </motion.div>
                        <motion.div variants={fadeInUp} className="space-y-1.5">
                          <Label>What makes it better? (Relieving factors)</Label>
                          <Input placeholder="e.g. Rest, leaning forward, medication" value={form.relieving_factors} onChange={(e) => set('relieving_factors', e.target.value)} />
                        </motion.div>
                        <motion.div variants={fadeInUp} className="space-y-1.5">
                          <Label>Associated symptoms</Label>
                          <Input placeholder="e.g. Fever, cough, nausea, dizziness" value={form.associated_symptoms} onChange={(e) => set('associated_symptoms', e.target.value)} />
                        </motion.div>
                      </CardContent>
                    </>
                  )}

                  {/* Step 3: Medical History */}
                  {currentStep === 2 && (
                    <>
                      <CardHeader><CardTitle className="text-lg">Medical History</CardTitle><CardDescription>Allergies, conditions, medications, and surgical history</CardDescription></CardHeader>
                      <CardContent className="space-y-4">
                        <motion.div variants={fadeInUp} className="space-y-1.5">
                          <Label>Known Allergies</Label>
                          <CheckboxGrid items={ALLERGIES} selected={form.allergies} field="allergies" />
                          <Input placeholder="Other allergies..." value={form.allergy_other} onChange={(e) => set('allergy_other', e.target.value)} className="mt-1.5" />
                        </motion.div>
                        <motion.div variants={fadeInUp} className="space-y-1.5">
                          <Label>Existing Conditions</Label>
                          <CheckboxGrid items={CONDITIONS} selected={form.conditions} field="conditions" />
                          <Input placeholder="Other conditions..." value={form.condition_other} onChange={(e) => set('condition_other', e.target.value)} className="mt-1.5" />
                        </motion.div>
                        <motion.div variants={fadeInUp} className="space-y-1.5">
                          <Label>Current Medications</Label>
                          <Textarea placeholder="List all current medications with dosages, e.g.&#10;Lisinopril 10mg daily&#10;Metformin 500mg BID&#10;Atorvastatin 20mg daily" value={form.current_medications} onChange={(e) => set('current_medications', e.target.value)} className="min-h-[70px] bg-white" />
                        </motion.div>
                        <div className="grid grid-cols-2 gap-3">
                          <motion.div variants={fadeInUp} className="space-y-1.5">
                            <Label>Past Surgeries</Label>
                            <Textarea placeholder="e.g. Appendectomy (2018)&#10;Knee arthroscopy (2020)" value={form.past_surgeries} onChange={(e) => set('past_surgeries', e.target.value)} className="min-h-[60px] bg-white" />
                          </motion.div>
                          <motion.div variants={fadeInUp} className="space-y-1.5">
                            <Label>Hospitalizations</Label>
                            <Textarea placeholder="e.g. Pneumonia (2019)&#10;None" value={form.hospitalizations} onChange={(e) => set('hospitalizations', e.target.value)} className="min-h-[60px] bg-white" />
                          </motion.div>
                        </div>
                      </CardContent>
                    </>
                  )}

                  {/* Step 4: Review of Systems */}
                  {currentStep === 3 && (
                    <>
                      <CardHeader><CardTitle className="text-lg">Review of Systems</CardTitle><CardDescription>Check any symptoms the patient is currently experiencing</CardDescription></CardHeader>
                      <CardContent className="space-y-3">
                        <motion.div variants={fadeInUp}>
                          <CheckboxGrid items={ROS_ITEMS} selected={form.ros_positive} field="ros_positive" cols={3} />
                        </motion.div>
                        <motion.div variants={fadeInUp} className="space-y-1.5 pt-2">
                          <Label>Additional ROS notes</Label>
                          <Textarea placeholder="Any other symptoms or relevant details..." value={form.ros_notes} onChange={(e) => set('ros_notes', e.target.value)} className="min-h-[60px] bg-white" />
                        </motion.div>
                      </CardContent>
                    </>
                  )}

                  {/* Step 5: Social & Family History */}
                  {currentStep === 4 && (
                    <>
                      <CardHeader><CardTitle className="text-lg">Social & Family History</CardTitle><CardDescription>Lifestyle factors and family medical history</CardDescription></CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <motion.div variants={fadeInUp} className="space-y-1.5">
                            <Label>Smoking</Label>
                            <Select value={form.smoking} onValueChange={(v) => set('smoking', v)}>
                              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                              <SelectContent>
                                {['Never', 'Former', 'Current — light', 'Current — moderate', 'Current — heavy'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </motion.div>
                          <motion.div variants={fadeInUp} className="space-y-1.5">
                            <Label>Alcohol</Label>
                            <Select value={form.alcohol} onValueChange={(v) => set('alcohol', v)}>
                              <SelectTrigger><SelectValue placeholder="Usage" /></SelectTrigger>
                              <SelectContent>
                                {['None', 'Social / occasional', 'Moderate (1-2/day)', 'Heavy (3+/day)', 'Former'].map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </motion.div>
                          <motion.div variants={fadeInUp} className="space-y-1.5">
                            <Label>Recreational drugs</Label>
                            <Select value={form.drugs} onValueChange={(v) => set('drugs', v)}>
                              <SelectTrigger><SelectValue placeholder="Usage" /></SelectTrigger>
                              <SelectContent>
                                {['None', 'Cannabis', 'Other — current', 'Other — former'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </motion.div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <motion.div variants={fadeInUp} className="space-y-1.5">
                            <Label>Occupation</Label>
                            <Input placeholder="e.g. Office worker, construction" value={form.occupation} onChange={(e) => set('occupation', e.target.value)} />
                          </motion.div>
                          <motion.div variants={fadeInUp} className="space-y-1.5">
                            <Label>Exercise level</Label>
                            <Select value={form.exercise} onValueChange={(v) => set('exercise', v)}>
                              <SelectTrigger><SelectValue placeholder="Activity" /></SelectTrigger>
                              <SelectContent>
                                {['Sedentary', 'Light (1-2x/week)', 'Moderate (3-4x/week)', 'Active (5+/week)'].map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </motion.div>
                        </div>
                        <motion.div variants={fadeInUp} className="space-y-1.5 pt-1">
                          <Label>Family history — conditions present in immediate family</Label>
                          <CheckboxGrid items={FAMILY_CONDITIONS} selected={form.family_history} field="family_history" />
                          <Input placeholder="Other family history..." value={form.family_other} onChange={(e) => set('family_other', e.target.value)} className="mt-1.5" />
                        </motion.div>
                      </CardContent>
                    </>
                  )}

                  {/* Step 6: Vitals */}
                  {currentStep === 5 && (
                    <>
                      <CardHeader><CardTitle className="text-lg">Vitals (Optional)</CardTitle><CardDescription>Pre-fill if vitals have already been taken. Can also be captured during the session.</CardDescription></CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <motion.div variants={fadeInUp} className="space-y-1.5">
                            <Label>Blood Pressure</Label>
                            <Input placeholder="e.g. 128/82" value={form.bp} onChange={(e) => set('bp', e.target.value)} />
                          </motion.div>
                          <motion.div variants={fadeInUp} className="space-y-1.5">
                            <Label>Heart Rate (bpm)</Label>
                            <Input type="number" placeholder="e.g. 72" value={form.heart_rate} onChange={(e) => set('heart_rate', e.target.value)} />
                          </motion.div>
                          <motion.div variants={fadeInUp} className="space-y-1.5">
                            <Label>Temperature (°C)</Label>
                            <Input type="number" step="0.1" placeholder="e.g. 37.0" value={form.temperature} onChange={(e) => set('temperature', e.target.value)} />
                          </motion.div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <motion.div variants={fadeInUp} className="space-y-1.5">
                            <Label>SpO2 (%)</Label>
                            <Input type="number" placeholder="e.g. 98" value={form.spo2} onChange={(e) => set('spo2', e.target.value)} />
                          </motion.div>
                          <motion.div variants={fadeInUp} className="space-y-1.5">
                            <Label>Respiratory Rate</Label>
                            <Input type="number" placeholder="e.g. 16" value={form.respiratory_rate} onChange={(e) => set('respiratory_rate', e.target.value)} />
                          </motion.div>
                          <motion.div variants={fadeInUp} className="space-y-1.5">
                            <Label>Weight (kg)</Label>
                            <Input type="number" step="0.1" placeholder="e.g. 75.5" value={form.weight} onChange={(e) => set('weight', e.target.value)} />
                          </motion.div>
                        </div>
                        <motion.div variants={fadeInUp} className="pt-3 p-4 rounded-lg bg-[hsl(var(--accent))]/50 border border-[hsl(var(--border))]/50">
                          <p className="text-[12px] text-[hsl(var(--muted-foreground))]">
                            <strong className="text-[hsl(var(--foreground))]">Ready to start.</strong> Cliro will have access to all the information you've entered. You can always update it during the session.
                          </p>
                        </motion.div>
                      </CardContent>
                    </>
                  )}

                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between px-6 pb-5 pt-2">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0} className="flex items-center gap-1 rounded-xl">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button type="button" onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep} disabled={!isStepValid() || isSubmitting} className="flex items-center gap-1 rounded-xl">
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

          <motion.div className="mt-3 text-center text-[10px] text-[hsl(var(--muted-foreground))]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NewSessionPage;
