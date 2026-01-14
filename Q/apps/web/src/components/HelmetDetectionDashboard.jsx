import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  Play,
  Square,
  Settings,
  AlertTriangle,
  CheckCircle,
  Activity,
  Eye,
  Clock,
  Database,
  Wifi,
  WifiOff,
} from "lucide-react";

export default function HelmetDetectionDashboard() {
  const [activeTab, setActiveTab] = useState("live");
  const [isDetectionActive, setIsDetectionActive] = useState(false);
  const queryClient = useQueryClient();

  // Fetch system status
  const { data: systemStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["system-status"],
    queryFn: async () => {
      const response = await fetch("/api/system/status");
      if (!response.ok) throw new Error("Failed to fetch system status");
      return response.json();
    },
    refetchInterval: 2000, // Refresh every 2 seconds for live data
  });

  // Fetch recent violations
  const { data: violationsData, isLoading: violationsLoading } = useQuery({
    queryKey: ["violations", { limit: 10 }],
    queryFn: async () => {
      const response = await fetch("/api/violations?limit=10");
      if (!response.ok) throw new Error("Failed to fetch violations");
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch system settings
  const { data: settings } = useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const response = await fetch("/api/system/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      return response.json();
    },
  });

  // Control system mutation
  const controlSystemMutation = useMutation({
    mutationFn: async ({ action, camera_source, session_data }) => {
      const response = await fetch("/api/system/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, camera_source, session_data }),
      });
      if (!response.ok) throw new Error("Failed to control system");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-status"] });
    },
  });

  // Create sample data mutation
  const createSampleDataMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/violations/sample", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to create sample data");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["violations"] });
      queryClient.invalidateQueries({ queryKey: ["system-status"] });
    },
  });

  // Start/Stop detection handlers
  const handleStartDetection = () => {
    controlSystemMutation.mutate({
      action: "start_detection",
      camera_source: settings?.camera_source || "0",
    });
    setIsDetectionActive(true);
  };

  const handleStopDetection = () => {
    controlSystemMutation.mutate({
      action: "stop_detection",
      session_data: { total_detections: systemStatus?.detection_count || 0 },
    });
    setIsDetectionActive(false);
  };

  return (
    <>
      {/* Header Navigation */}
      <header className="bg-white dark:bg-[#1E1E1E] border-b border-[#E5E5E5] dark:border-[#333333] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="font-big-shoulders-text font-black text-2xl text-[#0E0B18] dark:text-white uppercase">
              Helmet Detection System
            </h1>

            {/* Tab Navigation */}
            <nav className="flex space-x-6">
              {[
                { id: "live", label: "Live Detection", icon: Camera },
                {
                  id: "violations",
                  label: "Violation History",
                  icon: Database,
                },
                { id: "settings", label: "Settings", icon: Settings },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === id
                      ? "bg-[#5B4FE5] text-white"
                      : "text-[#555555] dark:text-[#B3B3B3] hover:text-[#5B4FE5] dark:hover:text-[#7B6FE5]"
                  }`}
                >
                  <Icon size={16} />
                  <span className="font-montserrat font-semibold text-sm uppercase tracking-wider">
                    {label}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* System Status Indicator */}
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                systemStatus?.camera_status === "connected"
                  ? "bg-green-100 dark:bg-green-900"
                  : "bg-red-100 dark:bg-red-900"
              }`}
            >
              {systemStatus?.camera_status === "connected" ? (
                <Wifi
                  size={14}
                  className="text-green-600 dark:text-green-400"
                />
              ) : (
                <WifiOff size={14} className="text-red-600 dark:text-red-400" />
              )}
              <span
                className={`text-xs font-medium ${
                  systemStatus?.camera_status === "connected"
                    ? "text-green-700 dark:text-green-300"
                    : "text-red-700 dark:text-red-300"
                }`}
              >
                {systemStatus?.camera_status === "connected"
                  ? "Connected"
                  : "Disconnected"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - System Controls */}
        <div className="w-80 bg-[#F8F4F1] dark:bg-[#1E1E1E] border-r border-[#E5E5E5] dark:border-[#333333] p-6">
          <div className="space-y-6">
            {/* Detection Control */}
            <div className="bg-white dark:bg-[#262626] rounded-lg p-4 border border-[#E5E5E5] dark:border-[#333333]">
              <h3 className="font-montserrat font-bold text-sm uppercase tracking-wider text-[#0D0B14] dark:text-white mb-4">
                Detection Control
              </h3>

              <div className="space-y-3">
                <button
                  onClick={
                    isDetectionActive
                      ? handleStopDetection
                      : handleStartDetection
                  }
                  disabled={controlSystemMutation.isPending}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isDetectionActive
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-[#5B4FE5] hover:bg-[#4A3FD4] text-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isDetectionActive ? (
                    <Square size={16} />
                  ) : (
                    <Play size={16} />
                  )}
                  <span>
                    {isDetectionActive ? "Stop Detection" : "Start Detection"}
                  </span>
                </button>

                {/* Camera Source Selection */}
                <div>
                  <label className="block text-xs font-medium text-[#6F6A79] dark:text-[#B3B3B3] mb-2 uppercase tracking-wider">
                    Camera Source
                  </label>
                  <select className="w-full px-3 py-2 border border-[#E5E5E5] dark:border-[#333333] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#0D0B14] dark:text-white text-sm">
                    <option value="0">Camera 0 (Default)</option>
                    <option value="1">Camera 1</option>
                    <option value="video">Video File</option>
                  </select>
                </div>

                {/* Detection Sensitivity */}
                <div>
                  <label className="block text-xs font-medium text-[#6F6A79] dark:text-[#B3B3B3] mb-2 uppercase tracking-wider">
                    Detection Sensitivity
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    defaultValue={settings?.detection_sensitivity || "0.7"}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-[#6F6A79] dark:text-[#B3B3B3] mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white dark:bg-[#262626] rounded-lg p-4 border border-[#E5E5E5] dark:border-[#333333]">
              <h3 className="font-montserrat font-bold text-sm uppercase tracking-wider text-[#0D0B14] dark:text-white mb-4">
                System Health
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6F6A79] dark:text-[#B3B3B3]">
                    Processing FPS
                  </span>
                  <span className="font-medium text-[#0D0B14] dark:text-white">
                    {systemStatus?.processing_fps || "0.0"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6F6A79] dark:text-[#B3B3B3]">
                    Detection Count
                  </span>
                  <span className="font-medium text-[#0D0B14] dark:text-white">
                    {systemStatus?.detection_count || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6F6A79] dark:text-[#B3B3B3]">
                    System Health
                  </span>
                  <div className="flex items-center space-x-2">
                    {systemStatus?.system_health === "good" ? (
                      <CheckCircle size={14} className="text-green-500" />
                    ) : (
                      <AlertTriangle size={14} className="text-yellow-500" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        systemStatus?.system_health === "good"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {systemStatus?.system_health || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Content */}
          {activeTab === "live" && (
            <div className="flex-1 bg-black flex items-center justify-center relative">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Camera size={64} className="text-white opacity-50 mx-auto" />
                  <p className="text-white text-lg">Live Camera Feed</p>
                  <p className="text-white opacity-70 text-sm">
                    {isDetectionActive
                      ? "Detection Active - Monitoring for violations"
                      : "Start detection to view live feed"}
                  </p>
                </div>
              </div>

              {/* Detection Status Overlay */}
              {isDetectionActive && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">LIVE</span>
                </div>
              )}
            </div>
          )}

          {activeTab === "violations" && (
            <div className="flex-1 bg-white dark:bg-[#121212] p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-big-shoulders-text font-black text-2xl text-[#0E0B18] dark:text-white uppercase">
                    Violation History
                  </h2>

                  <div className="flex items-center space-x-4">
                    <select className="px-3 py-2 border border-[#E5E5E5] dark:border-[#333333] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#0D0B14] dark:text-white text-sm">
                      <option value="">All Violations</option>
                      <option value="false">Unreviewed</option>
                      <option value="true">Reviewed</option>
                    </select>

                    <button className="px-4 py-2 bg-[#5B4FE5] text-white rounded-lg text-sm font-medium hover:bg-[#4A3FD4] transition-colors">
                      Export Data
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {violationsData?.violations?.map((violation) => (
                    <div
                      key={violation.id}
                      className="bg-white dark:bg-[#1E1E1E] border border-[#E5E5E5] dark:border-[#333333] rounded-lg p-6"
                    >
                      <div className="flex items-start space-x-6">
                        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <AlertTriangle size={24} className="text-red-500" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-montserrat font-bold text-lg text-[#0D0B14] dark:text-white">
                                Violation #{violation.id}
                              </h3>
                              <p className="text-[#6F6A79] dark:text-[#B3B3B3] text-sm mt-1">
                                {new Date(
                                  violation.violation_time,
                                ).toLocaleString()}
                              </p>
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  violation.reviewed
                                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                                }`}
                              >
                                {violation.reviewed ? "Reviewed" : "Pending"}
                              </button>

                              {violation.flagged && (
                                <button className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                                  Flagged
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-[#6F6A79] dark:text-[#B3B3B3] uppercase tracking-wider">
                                License Plate
                              </p>
                              <p className="text-sm font-medium text-[#0D0B14] dark:text-white mt-1">
                                {violation.license_plate_text || "Not detected"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-[#6F6A79] dark:text-[#B3B3B3] uppercase tracking-wider">
                                Detection Confidence
                              </p>
                              <p className="text-sm font-medium text-[#0D0B14] dark:text-white mt-1">
                                {(
                                  (violation.detection_confidence || 0) * 100
                                ).toFixed(1)}
                                %
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-[#6F6A79] dark:text-[#B3B3B3] uppercase tracking-wider">
                                Camera Source
                              </p>
                              <p className="text-sm font-medium text-[#0D0B14] dark:text-white mt-1">
                                {violation.camera_source || "Unknown"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-[#6F6A79] dark:text-[#B3B3B3] uppercase tracking-wider">
                                OCR Confidence
                              </p>
                              <p className="text-sm font-medium text-[#0D0B14] dark:text-white mt-1">
                                {violation.license_plate_confidence
                                  ? (
                                      violation.license_plate_confidence * 100
                                    ).toFixed(1) + "%"
                                  : "N/A"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 mt-4">
                            <button className="px-4 py-2 bg-[#5B4FE5] text-white rounded-lg text-sm font-medium hover:bg-[#4A3FD4] transition-colors">
                              View Details
                            </button>
                            <button className="px-4 py-2 border border-[#E5E5E5] dark:border-[#333333] text-[#0D0B14] dark:text-white rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors">
                              Mark Reviewed
                            </button>
                            <button className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900 transition-colors">
                              Flag
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="flex-1 bg-white dark:bg-[#121212] p-6 overflow-y-auto">
              <div className="max-w-2xl mx-auto">
                <h2 className="font-big-shoulders-text font-black text-2xl text-[#0E0B18] dark:text-white uppercase mb-6">
                  System Settings
                </h2>

                <div className="space-y-6">
                  {/* Detection Settings */}
                  <div className="bg-white dark:bg-[#1E1E1E] border border-[#E5E5E5] dark:border-[#333333] rounded-lg p-6">
                    <h3 className="font-montserrat font-bold text-lg text-[#0D0B14] dark:text-white mb-4">
                      Detection Settings
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#6F6A79] dark:text-[#B3B3B3] mb-2">
                          Detection Sensitivity
                        </label>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.1"
                          defaultValue={
                            settings?.detection_sensitivity || "0.7"
                          }
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-[#6F6A79] dark:text-[#B3B3B3] mt-1">
                          <span>0.1 (Low)</span>
                          <span>1.0 (High)</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#6F6A79] dark:text-[#B3B3B3] mb-2">
                          Default Camera Source
                        </label>
                        <select className="w-full px-3 py-2 border border-[#E5E5E5] dark:border-[#333333] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#0D0B14] dark:text-white">
                          <option value="0">Camera 0 (Default)</option>
                          <option value="1">Camera 1</option>
                          <option value="2">Camera 2</option>
                          <option value="video">Video File Input</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="auto_capture"
                          defaultChecked={settings?.auto_capture === "true"}
                          className="w-4 h-4 text-[#5B4FE5] border-gray-300 rounded focus:ring-[#5B4FE5]"
                        />
                        <label
                          htmlFor="auto_capture"
                          className="text-sm text-[#0D0B14] dark:text-white"
                        >
                          Auto-capture violation images
                        </label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="ocr_enabled"
                          defaultChecked={settings?.ocr_enabled === "true"}
                          className="w-4 h-4 text-[#5B4FE5] border-gray-300 rounded focus:ring-[#5B4FE5]"
                        />
                        <label
                          htmlFor="ocr_enabled"
                          className="text-sm text-[#0D0B14] dark:text-white"
                        >
                          Enable license plate OCR
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Storage Settings */}
                  <div className="bg-white dark:bg-[#1E1E1E] border border-[#E5E5E5] dark:border-[#333333] rounded-lg p-6">
                    <h3 className="font-montserrat font-bold text-lg text-[#0D0B14] dark:text-white mb-4">
                      Storage Settings
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#6F6A79] dark:text-[#B3B3B3] mb-2">
                          Storage Path
                        </label>
                        <input
                          type="text"
                          defaultValue={
                            settings?.storage_path || "./violations/"
                          }
                          className="w-full px-3 py-2 border border-[#E5E5E5] dark:border-[#333333] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#0D0B14] dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#6F6A79] dark:text-[#B3B3B3] mb-2">
                          Data Retention (Days)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="365"
                          defaultValue={settings?.max_storage_days || "30"}
                          className="w-full px-3 py-2 border border-[#E5E5E5] dark:border-[#333333] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#0D0B14] dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <button className="px-6 py-3 bg-[#5B4FE5] text-white rounded-lg font-medium hover:bg-[#4A3FD4] transition-colors">
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Recent Violations */}
        <div className="w-80 bg-white dark:bg-[#1E1E1E] border-l border-[#E5E5E5] dark:border-[#333333] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-montserrat font-bold text-sm uppercase tracking-wider text-[#0D0B14] dark:text-white">
              Recent Violations
            </h3>

            <button
              onClick={() => createSampleDataMutation.mutate()}
              disabled={createSampleDataMutation.isPending}
              className="px-3 py-1 bg-[#5B4FE5] text-white rounded text-xs font-medium hover:bg-[#4A3FD4] transition-colors disabled:opacity-50"
            >
              {createSampleDataMutation.isPending
                ? "Creating..."
                : "Sample Data"}
            </button>
          </div>

          <div className="space-y-3">
            {violationsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5B4FE5] mx-auto"></div>
                <p className="text-sm text-[#6F6A79] dark:text-[#B3B3B3] mt-2">
                  Loading violations...
                </p>
              </div>
            ) : violationsData?.violations?.length > 0 ? (
              violationsData.violations.map((violation) => (
                <div
                  key={violation.id}
                  className="bg-[#F8F4F1] dark:bg-[#262626] rounded-lg p-3 border border-[#E5E5E5] dark:border-[#333333]"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <AlertTriangle size={16} className="text-red-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0D0B14] dark:text-white">
                        Violation #{violation.id}
                      </p>
                      <p className="text-xs text-[#6F6A79] dark:text-[#B3B3B3]">
                        {new Date(violation.violation_time).toLocaleString()}
                      </p>
                      {violation.license_plate_text && (
                        <p className="text-xs text-[#5B4FE5] font-medium mt-1">
                          Plate: {violation.license_plate_text}
                        </p>
                      )}
                      <p className="text-xs text-[#6F6A79] dark:text-[#B3B3B3]">
                        Confidence:{" "}
                        {((violation.detection_confidence || 0) * 100).toFixed(
                          1,
                        )}
                        %
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <AlertTriangle
                  size={32}
                  className="text-gray-400 mx-auto mb-2"
                />
                <p className="text-sm text-[#6F6A79] dark:text-[#B3B3B3]">
                  No violations detected
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Status Bar - Only on Live Detection Tab */}
      {activeTab === "live" && (
        <div className="bg-[#F8F4F1] dark:bg-[#262626] border-t border-[#E5E5E5] dark:border-[#333333] px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Activity size={16} className="text-[#5B4FE5]" />
                <span className="text-sm text-[#6F6A79] dark:text-[#B3B3B3]">
                  Processing: {systemStatus?.processing_fps || "0.0"} FPS
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Eye size={16} className="text-[#5B4FE5]" />
                <span className="text-sm text-[#6F6A79] dark:text-[#B3B3B3]">
                  Detections: {systemStatus?.detection_count || 0}
                </span>
              </div>

              {systemStatus?.last_detection && (
                <div className="flex items-center space-x-2">
                  <Clock size={16} className="text-[#5B4FE5]" />
                  <span className="text-sm text-[#6F6A79] dark:text-[#B3B3B3]">
                    Last:{" "}
                    {new Date(systemStatus.last_detection).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>

            <div className="text-sm text-[#6F6A79] dark:text-[#B3B3B3]">
              Helmet Detection System v1.0
            </div>
          </div>
        </div>
      )}

      {/* Font loading styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Text:wght@900&family=Montserrat:wght@600;700&display=swap');
        
        .font-big-shoulders-text {
          font-family: 'Big Shoulders Text', cursive;
        }
        
        .font-montserrat {
          font-family: 'Montserrat', sans-serif;
        }

        /* Custom scrollbar for right panel */
        .space-y-3::-webkit-scrollbar {
          width: 4px;
        }
        
        .space-y-3::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .space-y-3::-webkit-scrollbar-thumb {
          background: #5B4FE5;
          border-radius: 2px;
        }
      `}</style>
    </>
  );
}
