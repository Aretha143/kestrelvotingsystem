import React from 'react';
import { useQuery } from 'react-query';
import { X, TrendingUp, Award, Users, MessageSquare, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const ResultsModal = ({ campaign, onClose }) => {
  const { data: results, isLoading } = useQuery(
    ['campaignResults', campaign.id],
    async () => {
      const response = await axios.get(`/votes/results/${campaign.id}`);
      return response.data.data;
    },
    {
      enabled: !!campaign,
    }
  );

  const { data: stats } = useQuery(
    ['campaignStats', campaign.id],
    async () => {
      const response = await axios.get(`/votes/stats/${campaign.id}`);
      return response.data.data;
    },
    {
      enabled: !!campaign,
    }
  );

  const chartData = results?.results?.map((result, index) => ({
    name: result.name,
    votes: result.voteCount,
    position: result.position,
    department: result.department,
    rank: index + 1,
  })) || [];

  const winner = results?.results?.[0];

  const handleClose = () => {
    console.log('ResultsModal handleClose called');
    onClose();
  };

  const handleBackdropClick = (e) => {
    console.log('ResultsModal backdrop clicked, target:', e.target);
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleModalClick = (e) => {
    console.log('ResultsModal clicked, preventing propagation');
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ zIndex: 9999 }}
      onClick={handleBackdropClick}
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

        {/* Modal */}
        <div
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
          onClick={handleModalClick}
        >
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-kestrel-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-kestrel-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Voting Results
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="btn-ghost p-1 rounded-lg hover:bg-gray-100"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="card-body">
              {/* Campaign Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{campaign.title}</h4>
                {campaign.description && (
                  <p className="text-sm text-gray-600 mb-3">{campaign.description}</p>
                )}
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Ended: {new Date(campaign.end_date).toLocaleDateString()}</span>
                  </div>
                  {stats && (
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{stats.uniqueVoters} of {stats.totalStaff} staff voted</span>
                    </div>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-kestrel-200 border-t-kestrel-600 rounded-full animate-spin"></div>
                </div>
              ) : results ? (
                <div className="space-y-6">
                  {/* Winner Section */}
                  {winner && winner.voteCount > 0 && (
                    <div className="p-6 bg-gradient-to-r from-kestrel-50 to-orange-50 border border-kestrel-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-kestrel-500 to-kestrel-600 rounded-full flex items-center justify-center">
                          <Award className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h5 className="text-xl font-bold text-gray-900 mb-1">
                            🏆 Staff of the Month Winner
                          </h5>
                          <p className="text-lg font-semibold text-kestrel-600 mb-1">
                            {winner.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {winner.position} • {winner.department}
                          </p>
                          <p className="text-sm text-gray-600 mt-2">
                            Received {winner.voteCount} vote{winner.voteCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Results Chart */}
                  {chartData.length > 0 && (
                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-900 flex items-center space-x-2">
                        <BarChart className="w-5 h-5 text-kestrel-600" />
                        <span>Vote Distribution</span>
                      </h5>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="name" 
                              angle={-45}
                              textAnchor="end"
                              height={80}
                              fontSize={12}
                            />
                            <YAxis />
                            <Tooltip 
                              formatter={(value, name) => [value, 'Votes']}
                              labelFormatter={(label) => `Staff: ${label}`}
                            />
                            <Bar 
                              dataKey="votes" 
                              fill="#f2750a"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Detailed Results Table */}
                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-900 flex items-center space-x-2">
                      <Users className="w-5 h-5 text-kestrel-600" />
                      <span>Detailed Results</span>
                    </h5>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Rank
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Staff Member
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Position
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Department
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Votes
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {results.results?.map((result, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {index === 0 && result.voteCount > 0 ? (
                                    <div className="w-6 h-6 bg-kestrel-500 rounded-full flex items-center justify-center">
                                      <Award className="w-3 h-3 text-white" />
                                    </div>
                                  ) : (
                                    <span className="text-sm font-medium text-gray-900">
                                      #{index + 1}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {result.name}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {result.position}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {result.department}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className="text-sm font-medium text-gray-900">
                                  {result.voteCount}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Voting Reasons */}
                  {results.results?.some(r => r.reasons?.length > 0) && (
                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-900 flex items-center space-x-2">
                        <MessageSquare className="w-5 h-5 text-kestrel-600" />
                        <span>Voting Reasons</span>
                      </h5>
                      <div className="space-y-3">
                        {results.results?.map((result, index) => (
                          result.reasons?.length > 0 && (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg">
                              <h6 className="font-medium text-gray-900 mb-2">
                                {result.name} ({result.voteCount} vote{result.voteCount !== 1 ? 's' : ''})
                              </h6>
                              <div className="space-y-2">
                                {result.reasons.slice(0, 3).map((reason, reasonIndex) => (
                                  <div key={reasonIndex} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                    "{reason}"
                                  </div>
                                ))}
                                {result.reasons.length > 3 && (
                                  <p className="text-xs text-gray-500">
                                    ... and {result.reasons.length - 3} more reasons
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    No Results Available
                  </h4>
                  <p className="text-gray-600">
                    Results will be available once the campaign ends and votes are tallied.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsModal;
