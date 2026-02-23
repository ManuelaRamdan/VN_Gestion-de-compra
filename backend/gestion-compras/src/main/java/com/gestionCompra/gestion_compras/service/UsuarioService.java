package com.gestionCompra.gestion_compras.service;

import com.gestionCompra.gestion_compras.dto.RegistroRequest;
import com.gestionCompra.gestion_compras.domain.entidades.Sector;
import com.gestionCompra.gestion_compras.domain.entidades.Usuario;
import com.gestionCompra.gestion_compras.dto.ManejoErrores;
import com.gestionCompra.gestion_compras.repository.SectorRepo;
import com.gestionCompra.gestion_compras.repository.UsuarioRepo;
import com.gestionCompra.gestion_compras.seguridad.UsuarioDetalles;
import com.gestionCompra.gestion_compras.util.ABMGenerico;
import com.gestionCompra.gestion_compras.util.ABMLogicoGenerico;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UsuarioService extends ABMLogicoGenerico<Usuario, Integer> implements UserDetailsService {

    @Autowired
    private UsuarioRepo usuarioRepository;

    @Autowired
    private SectorRepo sectorRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // --- Implementación obligatoria para ABMGenerico ---
    @Override
    protected JpaRepository<Usuario, Integer> getRepository() {
        return usuarioRepository;
    }

    @Override
    protected String getEntityName() {
        return "Usuario";
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return usuarioRepository.findByUsernameAndActivoTrue(username)
                .map(u -> new UsuarioDetalles(
                u.getUsername(),
                u.getPassword(),
                u.getSector().getNombre(),
                u.getActivo(),
                u.getIdUsuario()
        ))
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
    }

    @Transactional
    public Usuario registrarNuevoUsuario(RegistroRequest datos) {

        if (usuarioRepository.findByUsernameAndActivoTrue(datos.username()).isPresent()) {
            throw new ManejoErrores(
                    HttpStatus.BAD_REQUEST,
                    "El nombre de usuario ya está en uso"
            );
        }
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setUsername(datos.username());
        nuevoUsuario.setPassword(passwordEncoder.encode(datos.password()));

        Sector sector = sectorRepo.findById(datos.idSector())
                .orElseThrow(() -> new ManejoErrores(HttpStatus.NOT_FOUND, "El sector con ID " + datos.idSector() + " no existe"));
        nuevoUsuario.setSector(sector);

        nuevoUsuario.setActivo(true);

        return usuarioRepository.save(nuevoUsuario);
    }

    @Transactional
    public Usuario modificarUsuario(Integer id, RegistroRequest datos) {
        Usuario usuario = findById(id);

        if (datos.username() != null) {
            usuarioRepository.findByUsernameAndActivoTrue(datos.username())
                    .ifPresent(u -> {
                        if (!u.getIdUsuario().equals(id)) {
                            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre de usuario ya está en uso");
                        }
                    });
            usuario.setUsername(datos.username());
        }

        if (datos.password() != null && !datos.password().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(datos.password()));
        }

        if (datos.idSector() != null) {
            Sector sector = sectorRepo.findById(datos.idSector())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sector no encontrado"));
            usuario.setSector(sector);
        }
        return usuarioRepository.save(usuario);
    }

    public Page<Usuario> listarUsuariosActivos(Pageable paginacion) {
        return usuarioRepository.findAllByActivoTrue(paginacion);
    }

    public Usuario buscarUsuario(Integer id) {
        return usuarioRepository.findByIdAndActivoTrue(id)
                .orElseThrow(() -> new ManejoErrores(HttpStatus.NOT_FOUND, "Usuario no encontrado o inactivo"));
    }
}
