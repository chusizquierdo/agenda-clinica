// src/components/VistaAdministracion.jsx
import React from 'react';
import Estadisticas from './Estadisticas';
import GestionPersonal from './GestionPersonal';
import GestionVacaciones from './GestionVacaciones';
import GestionPacientes from './GestionPacientes';

function VistaAdministracion({
  vistaActual,
  citas,
  personalList,
  vacaciones,
  pacientes,
  onAddPersonal,
  onUpdatePersonal,
  onDeletePersonal,
  onAddVacacion,
  onDeleteVacacion,
  onAddPaciente,
  onUpdatePaciente,
  onDeletePaciente,
  onVolver
}) {
  switch (vistaActual) {
    case 'estadisticas':
      return <Estadisticas citas={citas} personalList={personalList} />;
      
    case 'personal':
      return (
        <GestionPersonal 
          personal={personalList}
          onAdd={onAddPersonal}
          onUpdate={onUpdatePersonal}
          onDelete={onDeletePersonal}
          onVolver={onVolver}
        />
      );
      
    case 'vacaciones':
      return (
        <GestionVacaciones
          personal={personalList}
          vacaciones={vacaciones}
          onAdd={onAddVacacion}
          onDelete={onDeleteVacacion}
          onVolver={onVolver}
        />
      );
      
    case 'pacientes':
      return (
        <GestionPacientes 
          pacientes={pacientes}
          onAddPaciente={onAddPaciente}
          onUpdatePaciente={onUpdatePaciente}
          onDeletePaciente={onDeletePaciente}
        />
      );

    default:
      return null;
  }
}

export default VistaAdministracion;