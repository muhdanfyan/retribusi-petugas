import { useState } from 'react';
import { Search, Filter, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Verification as VerificationType } from '../types';

export default function Verification() {
  const [verifications, setVerifications] = useState<VerificationType[]>([
    { id: '1', documentNumber: 'DOC-2025-001', taxpayerName: 'PT Maju Jaya', type: 'Retribusi Pasar', amount: 2500000, status: 'pending', submittedAt: '2025-10-28 10:30', sla: 2 },
    { id: '2', documentNumber: 'DOC-2025-002', taxpayerName: 'CV Berkah', type: 'Pajak Reklame', amount: 1800000, status: 'in_review', submittedAt: '2025-10-29 14:15', sla: 5, verifier: 'Verifikator 1' },
    { id: '3', documentNumber: 'DOC-2025-003', taxpayerName: 'UD Sejahtera', type: 'Retribusi Parkir', amount: 950000, status: 'approved', submittedAt: '2025-10-25 09:00', sla: 0, verifier: 'Verifikator 2' },
    { id: '4', documentNumber: 'DOC-2025-004', taxpayerName: 'PT Global', type: 'Pajak Hotel', amount: 3200000, status: 'rejected', submittedAt: '2025-10-26 16:45', sla: 0, verifier: 'Verifikator 1' },
    { id: '5', documentNumber: 'DOC-2025-005', taxpayerName: 'CV Makmur', type: 'Retribusi Pasar', amount: 1500000, status: 'in_review', submittedAt: '2025-10-30 11:20', sla: 8, verifier: 'Verifikator 3' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_review' | 'approved' | 'rejected'>('all');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<VerificationType | null>(null);

  const handleReview = (verification: VerificationType) => {
    setSelectedVerification(verification);
    setShowReviewModal(true);
  };

  const handleApprove = () => {
    if (selectedVerification) {
      setVerifications(
        verifications.map((v) =>
          v.id === selectedVerification.id
            ? { ...v, status: 'approved', verifier: 'Verifikator 1' }
            : v
        )
      );
      setShowReviewModal(false);
    }
  };

  const handleReject = () => {
    if (selectedVerification) {
      setVerifications(
        verifications.map((v) =>
          v.id === selectedVerification.id
            ? { ...v, status: 'rejected', verifier: 'Verifikator 1' }
            : v
        )
      );
      setShowReviewModal(false);
    }
  };

  const filteredVerifications = verifications.filter((verification) => {
    const matchesSearch =
      verification.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.taxpayerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || verification.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const summary = {
    pending: verifications.filter((v) => v.status === 'pending').length,
    in_review: verifications.filter((v) => v.status === 'in_review').length,
    approved: verifications.filter((v) => v.status === 'approved').length,
    rejected: verifications.filter((v) => v.status === 'rejected').length,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Verifikasi & Approval</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Multi-stage approval workflow dan document verification
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
            {summary.pending}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">In Review</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {summary.in_review}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {summary.approved}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {summary.rejected}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari nomor dokumen atau nama wajib pajak..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="in_review">In Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Wajib Pajak
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Jenis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  SLA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredVerifications.map((verification) => (
                <tr key={verification.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {verification.documentNumber}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">
                      {verification.submittedAt}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {verification.taxpayerName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {verification.type}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(verification.amount)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {verification.status === 'pending' || verification.status === 'in_review' ? (
                      <div className="flex items-center gap-1">
                        <Clock className={`w-4 h-4 ${verification.sla <= 3 ? 'text-red-500' : 'text-yellow-500'}`} />
                        <span className={`font-medium ${verification.sla <= 3 ? 'text-red-600' : 'text-yellow-600'}`}>
                          {verification.sla}h
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        verification.status === 'approved'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : verification.status === 'rejected'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : verification.status === 'in_review'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                    >
                      {verification.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    {(verification.status === 'pending' || verification.status === 'in_review') && (
                      <button
                        onClick={() => handleReview(verification)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Review
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showReviewModal && selectedVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Review Document
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Document Number</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {selectedVerification.documentNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Wajib Pajak</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {selectedVerification.taxpayerName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Jenis</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {selectedVerification.type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Jumlah</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {formatCurrency(selectedVerification.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Submitted At</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {selectedVerification.submittedAt}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">SLA Remaining</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {selectedVerification.sla} hours
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Catatan Verifikasi</p>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan catatan verifikasi..."
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
