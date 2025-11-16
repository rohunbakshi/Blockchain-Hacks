import { useState, useEffect } from 'react';
import { X, GraduationCap, Briefcase, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import {
  EducationCredential,
  EmploymentCredential,
  saveEducationCredential,
  saveEmploymentCredential,
  deleteEducationCredential,
  deleteEmploymentCredential,
} from '../services/api';

interface CredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  type: 'education' | 'employment' | null;
  credential?: EducationCredential | EmploymentCredential | null;
  onSuccess: () => void;
}

export function CredentialModal({
  isOpen,
  onClose,
  walletAddress,
  type,
  credential,
  onSuccess,
}: CredentialModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Education form state
  const [school, setSchool] = useState('');
  const [degree, setDegree] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [graduationYear, setGraduationYear] = useState('');

  // Employment form state
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (type === 'education' && credential) {
        const edu = credential as EducationCredential;
        setSchool(edu.school || '');
        setDegree(edu.degree || '');
        setFieldOfStudy(edu.fieldOfStudy || '');
        setGraduationYear(edu.graduationYear || '');
      } else if (type === 'education') {
        setSchool('');
        setDegree('');
        setFieldOfStudy('');
        setGraduationYear('');
      }

      if (type === 'employment' && credential) {
        const emp = credential as EmploymentCredential;
        setCompany(emp.company || '');
        setPosition(emp.position || '');
        setStartDate(emp.startDate || '');
        setEndDate(emp.endDate || '');
        setIsCurrent(emp.isCurrent || false);
      } else if (type === 'employment') {
        setCompany('');
        setPosition('');
        setStartDate('');
        setEndDate('');
        setIsCurrent(false);
      }
    }
  }, [isOpen, type, credential]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletAddress) {
      toast.error('Wallet address is required');
      return;
    }

    setIsLoading(true);

    try {
      if (type === 'education') {
        if (!school || !graduationYear) {
          toast.error('School and graduation year are required');
          setIsLoading(false);
          return;
        }

        await saveEducationCredential(walletAddress, {
          id: credential?.id,
          school,
          degree: degree || undefined,
          fieldOfStudy: fieldOfStudy || undefined,
          graduationYear,
          verified: credential?.verified || false,
        });

        toast.success(credential ? 'Education updated successfully!' : 'Education added successfully!');
      } else if (type === 'employment') {
        if (!company || !position) {
          toast.error('Company and position are required');
          setIsLoading(false);
          return;
        }

        await saveEmploymentCredential(walletAddress, {
          id: credential?.id,
          company,
          position,
          startDate: startDate || undefined,
          endDate: isCurrent ? undefined : endDate || undefined,
          isCurrent,
          verified: credential?.verified || false,
        });

        toast.success(credential ? 'Employment updated successfully!' : 'Employment added successfully!');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save credential');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!credential || !credential.id) {
      return;
    }

    if (!confirm(`Are you sure you want to delete this ${type === 'education' ? 'education' : 'employment'} credential?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      if (type === 'education') {
        await deleteEducationCredential(walletAddress, credential.id);
        toast.success('Education credential deleted successfully!');
      } else if (type === 'employment') {
        await deleteEmploymentCredential(walletAddress, credential.id);
        toast.success('Employment credential deleted successfully!');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete credential');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !type) return null;

  const isEditMode = !!credential;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-8 z-50">
      <div className="bg-white/95 backdrop-blur-xl border border-teal-200/50 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-teal-200/50 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            {type === 'education' ? (
              <GraduationCap className="w-6 h-6 text-blue-600" />
            ) : (
              <Briefcase className="w-6 h-6 text-purple-600" />
            )}
            <h2 className="text-2xl text-slate-900">
              {isEditMode ? 'Edit' : 'Add'} {type === 'education' ? 'Education' : 'Employment'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-teal-50 rounded-xl transition-all"
            disabled={isLoading || isDeleting}
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {type === 'education' ? (
            <>
              <div>
                <Label htmlFor="school" className="text-teal-700 mb-2 block">
                  School/Institution *
                </Label>
                <Input
                  id="school"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="e.g., MIT, Stanford University"
                  className="border-2 border-teal-200/50 focus:border-teal-500 rounded-xl h-12"
                  required
                  disabled={isLoading || isDeleting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="degree" className="text-teal-700 mb-2 block">
                    Degree
                  </Label>
                  <Input
                    id="degree"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g., Bachelor's, Master's"
                    className="border-2 border-teal-200/50 focus:border-teal-500 rounded-xl h-12"
                    disabled={isLoading || isDeleting}
                  />
                </div>

                <div>
                  <Label htmlFor="fieldOfStudy" className="text-teal-700 mb-2 block">
                    Field of Study
                  </Label>
                  <Input
                    id="fieldOfStudy"
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    placeholder="e.g., Computer Science"
                    className="border-2 border-teal-200/50 focus:border-teal-500 rounded-xl h-12"
                    disabled={isLoading || isDeleting}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="graduationYear" className="text-teal-700 mb-2 block">
                  Graduation Year *
                </Label>
                <Input
                  id="graduationYear"
                  type="number"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  placeholder="e.g., 2024"
                  min="1900"
                  max="2100"
                  className="border-2 border-teal-200/50 focus:border-teal-500 rounded-xl h-12"
                  required
                  disabled={isLoading || isDeleting}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="company" className="text-teal-700 mb-2 block">
                  Company/Organization *
                </Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g., Google, Meta"
                  className="border-2 border-teal-200/50 focus:border-teal-500 rounded-xl h-12"
                  required
                  disabled={isLoading || isDeleting}
                />
              </div>

              <div>
                <Label htmlFor="position" className="text-teal-700 mb-2 block">
                  Position/Title *
                </Label>
                <Input
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g., Software Engineer, Product Manager"
                  className="border-2 border-teal-200/50 focus:border-teal-500 rounded-xl h-12"
                  required
                  disabled={isLoading || isDeleting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-teal-700 mb-2 block">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="month"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border-2 border-teal-200/50 focus:border-teal-500 rounded-xl h-12"
                    disabled={isLoading || isDeleting}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate" className="text-teal-700 mb-2 block">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="month"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border-2 border-teal-200/50 focus:border-teal-500 rounded-xl h-12"
                    disabled={isLoading || isDeleting || isCurrent}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isCurrent"
                  checked={isCurrent}
                  onCheckedChange={(checked) => setIsCurrent(checked === true)}
                  disabled={isLoading || isDeleting}
                />
                <Label
                  htmlFor="isCurrent"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  I currently work here
                </Label>
              </div>
            </>
          )}

          <div className="flex gap-4 pt-4 border-t border-teal-200/50">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white h-12 rounded-xl"
              disabled={isLoading || isDeleting}
            >
              {isLoading ? 'Saving...' : isEditMode ? 'Update' : 'Add'}
            </Button>

            {isEditMode && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                className="border-2 border-red-300 text-red-600 hover:bg-red-50 h-12 rounded-xl"
                disabled={isLoading || isDeleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-2 border-slate-300 hover:bg-slate-50 h-12 rounded-xl"
              disabled={isLoading || isDeleting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

