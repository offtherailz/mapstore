//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, vJAXB 2.1.10 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2014.06.13 at 10:49:44 AM CEST 
//


package eu.europa.emsa.csndc;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * NetCDF file describing a meteo feature (wind, wave) derived from the original satellite image
 * 
 * <p>Java class for SARDerivedDataReferenceType complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="SARDerivedDataReferenceType">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="sarDerivedFeature" type="{http://www.emsa.europa.eu/csndc}SARDerivedFeatureType"/>
 *         &lt;element ref="{http://www.emsa.europa.eu/csndc}fileName"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "SARDerivedDataReferenceType", propOrder = {
    "sarDerivedFeature",
    "fileName"
})
public class SARDerivedDataReferenceType {

    @XmlElement(required = true)
    protected SARDerivedFeatureType sarDerivedFeature;
    @XmlElement(required = true)
    protected String fileName;

    /**
     * Gets the value of the sarDerivedFeature property.
     * 
     * @return
     *     possible object is
     *     {@link SARDerivedFeatureType }
     *     
     */
    public SARDerivedFeatureType getSarDerivedFeature() {
        return sarDerivedFeature;
    }

    /**
     * Sets the value of the sarDerivedFeature property.
     * 
     * @param value
     *     allowed object is
     *     {@link SARDerivedFeatureType }
     *     
     */
    public void setSarDerivedFeature(SARDerivedFeatureType value) {
        this.sarDerivedFeature = value;
    }

    /**
     * Filename of the NetCDF file describing the SAR derived data
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getFileName() {
        return fileName;
    }

    /**
     * Sets the value of the fileName property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setFileName(String value) {
        this.fileName = value;
    }

}
