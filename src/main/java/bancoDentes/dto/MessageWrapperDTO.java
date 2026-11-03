package bancoDentes.dto;

import java.io.Serializable;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Date;

public class MessageWrapperDTO<T> implements Serializable {

    private static final long serialVersionUID = 8503352480335065064L;

    private int numeroTentativas;
    private Date dataCriacao;
    private String servidor;
    private T conteudo;

    public MessageWrapperDTO() {}

    public MessageWrapperDTO(final T conteudo) {
        this.numeroTentativas = 0;
        this.dataCriacao = new Date();
        this.servidor = getHost();
        this.conteudo = conteudo;
    }

    public int getNumeroTentativas() {
        return numeroTentativas;
    }

    public void setNumeroTentativas(int numeroTentativas) {
        this.numeroTentativas = numeroTentativas;
    }

    public Date getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(Date dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public String getServidor() {
        return servidor;
    }

    public void setServidor(String servidor) {
        this.servidor = servidor;
    }

    public T getConteudo() {
        return conteudo;
    }

    public void setConteudo(T conteudo) {
        this.conteudo = conteudo;
    }

    private static String getHost() {
        try {
            String local = InetAddress.getLocalHost().getHostName();
            int indexOf = local.indexOf('.');
            return indexOf > 0 ? local.substring(0, indexOf) : local;
        } catch (UnknownHostException e) {
            String message = e.getMessage();
            if (message != null) {
                int indexOf = message.indexOf(':');
                if (indexOf > 0) {
                    return message.substring(0, indexOf);
                }
            }
        }
        return "localhost";
    }
}