import React, { useState, useEffect } from 'react';
import type { User, AppConfig, CreditPackage } from '../types';
import { getAllUsers, addCreditsToUser, updateUserProfile } from '../services/authService'; // Import updateUserProfile
import { updateAppConfig } from '../services/configService';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';

interface DeveloperSettingsModalProps {
  currentConfig: AppConfig;
  onConfigSave: (newConfig: AppConfig) => void;
}

const DeveloperSettingsModal: React.FC<DeveloperSettingsModalProps> = ({ currentConfig, onConfigSave }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [creditsToAdd, setCreditsToAdd] = useState<{[key: string]: number}>({});
  const [config, setConfig] = useState<AppConfig>(currentConfig);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const userList = await getAllUsers();
        setUsers(userList);
        // Initialize creditsToAdd for all users
        const initialCreditsToAdd: { [key: string]: number } = {};
        userList.forEach((user: User) => initialCreditsToAdd[user.id] = 0);
        setCreditsToAdd(initialCreditsToAdd);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);
  
  const handleAddCredits = async (userId: string) => {
    const amount = creditsToAdd[userId];
    if (amount > 0) {
      await addCreditsToUser(userId, amount);
      // Refresh user list
      const userList = await getAllUsers();
      setUsers(userList);
      setCreditsToAdd((prev: { [key: string]: number }) => ({...prev, [userId]: 0})); // Explicitly type prev
    }
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type } = e.target;
      setConfig((prev: AppConfig) => ({...prev, [name]: type === 'number' ? Number(value) : value})); // Explicitly type prev
  };

  const handleCreditCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig((prev: AppConfig) => ({ // Explicitly type prev
        ...prev,
        creditCosts: {
            ...prev.creditCosts,
            [name]: Number(value)
        }
    }));
  };

  const handlePackageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const updatedPackages = [...config.creditPackages];
      const pkg = updatedPackages[index];
      const key = name as keyof CreditPackage;

      switch (key) {
        case 'credits':
        case 'price':
            (pkg[key] as number) = Number(value);
            break;
        case 'description':
        case 'currency':
            (pkg[key] as string) = value;
            break;
        // 'id' is readonly and not changed.
      }
      setConfig((prev: AppConfig) => ({...prev, creditPackages: updatedPackages})); // Explicitly type prev
  };
  
  const addPackage = () => {
      const newPackage: CreditPackage = { id: `p${Date.now()}`, credits: 0, price: 0, currency: 'ARS', description: 'Nuevo Paquete' };
      setConfig((prev: AppConfig) => ({...prev, creditPackages: [...prev.creditPackages, newPackage]})); // Explicitly type prev
  };
  
  const removePackage = (index: number) => {
      const updatedPackages = config.creditPackages.filter((_: CreditPackage, i: number) => i !== index); // Explicitly type _, i
      setConfig((prev: AppConfig) => ({...prev, creditPackages: updatedPackages})); // Explicitly type prev
  };
  
  const handleSaveConfig = async () => {
      try {
        await updateAppConfig(config);
        onConfigSave(config); // Update parent's state
        alert("Configuración guardada.");
      } catch (error) {
        console.error("Error al guardar la configuración:", error);
        alert("Error al guardar la configuración. Revisa la consola.");
      }
  };

  const handleTogglePremium = async (userId: string, currentStatus: boolean) => {
    try {
      await updateUserProfile(userId, { hasUnlimitedWorkspace: !currentStatus });
      // Refresh user list
      const userList = await getAllUsers();
      setUsers(userList);
      alert(`Estado Premium de ${users.find((u: User) => u.id === userId)?.name} actualizado.`);
    } catch (error) {
      console.error("Error toggling premium status:", error);
      alert("Error al cambiar el estado Premium. Revisa la consola.");
    }
  };


  return (
    <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
      {/* User Management */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Gestión de Usuarios</h3>
        {loadingUsers ? <p className="text-gray-700 dark:text-gray-300">Cargando usuarios...</p> : (
          <div className="space-y-2">
            {users.map((user: User) => (
              <div key={user.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm">
                <div className="mb-2 md:mb-0">
                  <p className="font-semibold text-gray-800 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Créditos: <span className="font-bold text-cyan-600 dark:text-cyan-400">{user.credits}</span></p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Premium: <span className={`font-bold ${user.hasUnlimitedWorkspace ? 'text-green-600' : 'text-red-600'}`}>{user.hasUnlimitedWorkspace ? 'Sí' : 'No'}</span></p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <input 
                    type="number"
                    min="0"
                    placeholder="Créditos"
                    className="w-24 p-1 border rounded dark:bg-gray-800 text-gray-800 dark:text-white text-sm"
                    value={creditsToAdd[user.id] || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreditsToAdd((prev: { [key: string]: number }) => ({...prev, [user.id]: parseInt(e.target.value, 10) || 0}))} // Explicitly type e, prev
                  />
                  <button onClick={() => handleAddCredits(user.id)} className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors">Añadir Créditos</button>
                  <button onClick={() => handleTogglePremium(user.id, user.hasUnlimitedWorkspace)} className={`px-3 py-1 text-sm rounded-md transition-colors ${user.hasUnlimitedWorkspace ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}>
                    {user.hasUnlimitedWorkspace ? 'Revocar Premium' : 'Otorgar Premium'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* App Config */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Configuración Global</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><label className="text-gray-700 dark:text-gray-300 text-sm">Créditos Iniciales</label><input type="number" name="initialCredits" value={config.initialCredits} onChange={handleConfigChange} className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 text-gray-800 dark:text-white" /></div>
            <div><label className="text-gray-700 dark:text-gray-300 text-sm">Slots Gratuitos</label><input type="number" name="freeWorkspaceSlots" value={config.freeWorkspaceSlots} onChange={handleConfigChange} className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 text-gray-800 dark:text-white" /></div>
            <div><label className="text-gray-700 dark:text-gray-300 text-sm">Slots por Compra</label><input type="number" name="slotsPerPurchase" value={config.slotsPerPurchase} onChange={handleConfigChange} className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 text-gray-800 dark:text-white" /></div>
            <div><label className="text-gray-700 dark:text-gray-300 text-sm">Límite de Resultados Búsqueda</label><input type="number" name="searchResultLimit" value={config.searchResultLimit} onChange={handleConfigChange} className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 text-gray-800 dark:text-white" /></div>
        </div>
      </div>
      
      {/* Credit Costs Configuration */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Costos de Créditos por Acción</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.entries(config.creditCosts) as [keyof typeof config.creditCosts, number][]).map(([key, value]: [keyof typeof config.creditCosts, number]) => ( // Explicitly type key, value
                <div key={key}>
                    <label className="text-gray-700 dark:text-gray-300 text-sm">{String(key).replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label> {/* Humanize key */}
                    <input type="number" name={key} value={value} onChange={handleCreditCostChange} className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 text-gray-800 dark:text-white" />
                </div>
            ))}
        </div>
      </div>
      
      {/* Credit Packages */}
       <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Paquetes de Créditos</h3>
        <div className="space-y-3">
            {config.creditPackages.map((pkg: CreditPackage, index: number) => (
                <div key={pkg.id} className="grid grid-cols-1 lg:grid-cols-5 gap-2 items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm">
                    <input type="text" name="id" placeholder="ID Paquete" value={pkg.id} readOnly className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 text-gray-800 dark:text-gray-400 text-sm" title="ID del paquete (solo lectura)"/>
                    <input type="number" name="credits" placeholder="Créditos" value={pkg.credits} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePackageChange(index, e)} className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 text-gray-800 dark:text-white text-sm"/>
                    <input type="number" name="price" placeholder="Precio (ARS)" value={pkg.price} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePackageChange(index, e)} className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 text-gray-800 dark:text-white text-sm"/>
                    <input type="text" name="description" placeholder="Descripción (ej: Mejor Valor)" value={pkg.description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePackageChange(index, e)} className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 text-gray-800 dark:text-white text-sm"/>
                    <button onClick={() => removePackage(index)} className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"><TrashIcon className="w-5 h-5 mx-auto"/></button>
                </div>
            ))}
             <button onClick={addPackage} className="flex items-center gap-2 px-3 py-1.5 text-sm text-cyan-600 font-semibold bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <PlusIcon className="w-4 h-4"/>Añadir Paquete
            </button>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button onClick={handleSaveConfig} className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700">
          Guardar Configuración
        </button>
      </div>
    </div>
  );
};

export default DeveloperSettingsModal;