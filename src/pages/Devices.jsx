import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { Cpu, Wifi, BatteryCharging, RefreshCw, Plus, Trash2, Power, PowerOff } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';

const Devices = () => {
  const [devices, setDevices] = useState([
    { id: 1, name: 'Lecture Hall ESP-01', deviceId: 'DEV-ESP32-A8', ip: '192.168.1.104', battery: 92, wifi: 'Excellent', status: 'Connected', lastSync: '2026-07-10 14:02' },
    { id: 2, name: 'CS Lab 2 Scanner', deviceId: 'DEV-ESP32-C4', ip: '192.168.1.112', battery: 85, wifi: 'Good', status: 'Connected', lastSync: '2026-07-10 13:58' },
    { id: 3, name: 'Engineering Wing B', deviceId: 'DEV-ESP32-F2', ip: '192.168.1.115', battery: 14, wifi: 'Fair', status: 'Battery Alert', lastSync: '2026-07-10 14:15' },
    { id: 4, name: 'Main Seminar Reader', deviceId: 'DEV-ESP32-S9', ip: '192.168.1.109', battery: 99, wifi: 'Excellent', status: 'Connected', lastSync: '2026-07-10 11:20' },
    { id: 5, name: 'Mobile Handheld B1', deviceId: 'DEV-ESP8266-M1', ip: '192.168.1.120', battery: 0, wifi: 'None', status: 'Offline', lastSync: '2026-07-09 18:40' },
  ]);

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pingingId, setPingingId] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const handleAddDevice = (data) => {
    setLoading(true);
    setTimeout(() => {
      const newDev = {
        ...data,
        id: Date.now(),
        battery: 100,
        wifi: 'Excellent',
        status: 'Connected',
        lastSync: 'Just now'
      };
      setDevices(prev => [newDev, ...prev]);
      toast.success(`Scanner terminal '${data.name}' registered successfully`);
      setIsModalOpen(false);
      setLoading(false);
    }, 800);
  };

  const handleTestConnection = (dev) => {
    setPingingId(dev.id);
    toast.loading(`Pinging biometric unit ${dev.deviceId} at ${dev.ip}...`, { id: 'ping-load' });
    
    setTimeout(() => {
      setPingingId(null);
      toast.dismiss('ping-load');
      
      if (dev.status === 'Offline') {
        Swal.fire({
          title: 'Ping Failed',
          text: `Biometric reader ${dev.name} (${dev.ip}) is offline. Please check its Wi-Fi power switch.`,
          icon: 'error',
          confirmButtonColor: '#4f46e5'
        });
      } else {
        Swal.fire({
          title: 'Device Healthy',
          html: `<b>Unit:</b> ${dev.name}<br/><b>Latency:</b> 14ms &bull; <b>Signal:</b> ${dev.wifi}<br/><b>Battery:</b> ${dev.battery}%<br/><b>Sync Status:</b> Valid`,
          icon: 'success',
          confirmButtonColor: '#4f46e5'
        });
      }
    }, 1200);
  };

  const toggleConnection = (dev) => {
    setDevices(prev => prev.map(d => {
      if (d.id === dev.id) {
        const isConnected = d.status !== 'Offline';
        return {
          ...d,
          status: isConnected ? 'Offline' : 'Connected',
          wifi: isConnected ? 'None' : 'Excellent',
          battery: isConnected ? 0 : 95
        };
      }
      return d;
    }));
    
    if (dev.status !== 'Offline') {
      toast.error(`Disconnected from biometric unit ${dev.name}`);
    } else {
      toast.success(`Connected to biometric unit ${dev.name}`);
    }
  };

  const handleDeleteDevice = (dev) => {
    Swal.fire({
      title: 'Deregister Device?',
      text: `You are about to remove scanner terminal ${dev.name} from the registry.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'Deregister'
    }).then((result) => {
      if (result.isConfirmed) {
        setDevices(prev => prev.filter(d => d.id !== dev.id));
        toast.success('Biometric device deleted');
      }
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Connected': return 'bg-emerald-500/10 text-emerald-500';
      case 'Battery Alert': return 'bg-amber-500/10 text-amber-500';
      default: return 'bg-slate-500/10 text-slate-500';
    }
  };

  const getBatteryIconColor = (level) => {
    if (level === 0) return 'text-slate-400';
    if (level < 20) return 'text-rose-500 animate-pulse';
    if (level < 50) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const columns = [
    {
      label: 'Terminal Name',
      key: 'name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-350">
            <Cpu className="h-4 w-4" />
          </div>
          <span className="font-bold text-slate-700 dark:text-slate-200">{row.name}</span>
        </div>
      )
    },
    { label: 'Device ID', key: 'deviceId', sortable: true },
    { label: 'IP Address', key: 'ip' },
    { 
      label: 'Battery', 
      key: 'battery',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5 font-semibold">
          <BatteryCharging className={`h-4.5 w-4.5 ${getBatteryIconColor(row.battery)}`} />
          <span>{row.battery}%</span>
        </div>
      )
    },
    { 
      label: 'Wi-Fi Signal', 
      key: 'wifi',
      render: (row) => (
        <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 font-medium">
          <Wifi className={`h-4 w-4 ${row.status !== 'Offline' ? 'text-indigo-500' : ''}`} />
          <span>{row.wifi}</span>
        </div>
      )
    },
    { 
      label: 'Status', 
      key: 'status',
      sortable: true,
      render: (row) => (
        <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getStatusStyle(row.status)}`}>
          {row.status}
        </span>
      )
    },
    { label: 'Last Sync', key: 'lastSync' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white md:text-2xl font-sans">
            Biometric Scanner Terminals
          </h2>
          <p className="text-xs font-medium text-slate-400">
            Manage portable Wi-Fi fingerprint scanners linked to lecture classrooms.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/10 hover:bg-indigo-700 hover:shadow-lg transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Scanner</span>
        </button>
      </div>

      {/* Table */}
      <Table 
        columns={columns}
        data={devices}
        searchKeys={['name', 'deviceId', 'ip']}
        searchPlaceholder="Search devices..."
        exportFilename="biometric_devices"
        printTitle="Biometric Devices Registry"
        actions={(row) => (
          <>
            <button 
              onClick={() => handleTestConnection(row)}
              disabled={pingingId !== null}
              className={`flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 transition-all ${pingingId === row.id ? 'opacity-50' : ''}`}
            >
              <RefreshCw className={`h-3 w-3 ${pingingId === row.id ? 'animate-spin' : ''}`} />
              <span>Ping</span>
            </button>
            <button 
              onClick={() => toggleConnection(row)}
              className={`rounded-lg p-1.5 transition-colors border ${
                row.status !== 'Offline' 
                  ? 'border-rose-100 hover:bg-rose-50 text-rose-500 dark:border-rose-950/20 dark:hover:bg-rose-950/20' 
                  : 'border-emerald-100 hover:bg-emerald-50 text-emerald-500 dark:border-emerald-950/20 dark:hover:bg-emerald-950/20'
              }`}
              title={row.status !== 'Offline' ? 'Disconnect' : 'Connect'}
            >
              {row.status !== 'Offline' ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
            </button>
            <button 
              onClick={() => handleDeleteDevice(row)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-rose-600 dark:hover:bg-slate-800 dark:hover:text-rose-400 border border-slate-100 dark:border-slate-850"
              title="Delete Device"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      />

      {/* Register Device Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Biometric Device"
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleSubmit(handleAddDevice)} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase">Device Friendly Name</label>
            <input 
              type="text" 
              placeholder="Lecture Hall ESP-01"
              {...register('name', { required: 'Device Name is required' })}
              className="glass-input mt-1.5"
            />
            {errors.name && <span className="text-[10px] text-rose-500">{errors.name.message}</span>}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase">Hardware ID (UUID)</label>
            <input 
              type="text" 
              placeholder="DEV-ESP32-A8"
              {...register('deviceId', { required: 'Device ID is required' })}
              className="glass-input mt-1.5"
            />
            {errors.deviceId && <span className="text-[10px] text-rose-500">{errors.deviceId.message}</span>}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase">IP Address</label>
            <input 
              type="text" 
              placeholder="192.168.1.104"
              {...register('ip', { 
                required: 'IP Address is required',
                pattern: {
                  value: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                  message: 'Invalid IP address'
                }
              })}
              className="glass-input mt-1.5"
            />
            {errors.ip && <span className="text-[10px] text-rose-500">{errors.ip.message}</span>}
          </div>

          <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800/80">
            <button 
              type="button"
              onClick={() => { setIsModalOpen(false); reset(); }}
              className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-400"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="rounded-xl bg-indigo-650 hover:bg-indigo-700 px-5 py-2.5 text-xs font-semibold text-white shadow shadow-indigo-500/10"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Devices;
