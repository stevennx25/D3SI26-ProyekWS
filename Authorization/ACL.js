const ACL = [
    {
        role: "rektorat",
        path: [
            "/api/dosen/tambah",
            "/api/dosen/ubah_prodi_jabatan"
        ]
    }, 
    {
        role: "pmb",
        path: [
            "/api/registrasi/list",
            "/api/registrasi/acc/:id",
            "/api/registrasi/reject/:id"
        ]
    }, {
        role: "super-admin",
        path: [
            "*"
        ]
    }
]
module.exports = {
    ACL
}