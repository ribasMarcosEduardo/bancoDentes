package bancoDentes.model.enumModels;

public enum StatusEtapa {
    PENDENTE("Pendente"),
    EM_ANDAMENTO("Em andamento"),
    FINALIZADO("Finalizado"),
    RECUSADO("Recusado");

    private final String nome;

    StatusEtapa(String nome) {
        this.nome = nome;
    }

    @Override
    public String toString() {
        return this.nome;
    }

    public String getNome() {
        return nome;
    }
    }